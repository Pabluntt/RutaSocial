package repository

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/Pabluntt/RutaSocial/Backend/internal/domain"
	"github.com/Pabluntt/RutaSocial/Backend/internal/utils"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// NotificationRepository define la interfaz para las operaciones relacionadas con notificaciones.
// Contiene métodos para crear, eliminar, actualizar, obtener notificaciones y marcar como leídas.
type NotificationRepository interface {
	CreateNotification(ctx context.Context, notification domain.Aviso) error
	DeleteNotification(ctx context.Context, notificationID string) error
	UpdateNotification(ctx context.Context, data map[string]interface{}) (domain.Aviso, error)
	GetNotifications(ctx context.Context) ([]domain.Aviso, error)
	FindByIDAndUserID(ctx context.Context, id string, userID string) error
	GetUnreadNotifications(ctx context.Context, userID string) ([]domain.Aviso, error)
	GetReadNotifications(ctx context.Context, userID string) ([]domain.Aviso, error)
	MarkNotificationAsRead(ctx context.Context, notificationID string, userID string) error
	DismissNotification(ctx context.Context, notificationID string, userID string) error
}

// notificationRepository implementa la interfaz NotificationRepository.
// Contiene colecciones de notificaciones, usuarios y relaciones de notificaciones con personas para interactuar con la base de datos.
type notificationRepository struct {
	NotificationsCollection              *mongo.Collection
	UserCollection                       *mongo.Collection
	NotificationPersonRelationCollection *mongo.Collection
}

// NewNotificationRepository crea una nueva instancia de notificationRepository.
// Recibe colecciones de notificaciones, usuarios y relaciones de notificaciones con personas y retorna una instancia de NotificationRepository.
func NewNotificationRepository(notificationsCollection, usersCollection, notificationUserRelation *mongo.Collection) NotificationRepository {
	return &notificationRepository{
		NotificationsCollection:              notificationsCollection,
		UserCollection:                       usersCollection,
		NotificationPersonRelationCollection: notificationUserRelation,
	}
}

// CreateNotification crea una nueva notificación en la base de datos.
// Asigna un ID y una fecha de creación a la notificación, inserta la notificación en la colección y envía correos electrónicos a los usuarios si es necesario.
// Si SendToAll es false (por defecto), solo notifica a usuarios activos de la misma institución que el autor.
func (n *notificationRepository) CreateNotification(ctx context.Context, notification domain.Aviso) error {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	notification.ID = bson.NewObjectID()
	notification.CreatedAt = time.Now()

	session, err := n.NotificationsCollection.Database().Client().StartSession()
	if err != nil {
		logRepositoryError(ctx, "notification", "create.start_session", err, "collection", "notifications")
		return err
	}
	defer session.EndSession(ctx)

	var recipients []domain.Usuario
	_, err = session.WithTransaction(ctx, func(sc context.Context) (interface{}, error) {
		users, err := n.insertNotificationWithRelations(sc, notification)
		if err != nil {
			return nil, err
		}
		recipients = users
		return nil, nil
	})
	if err != nil {
		if !isTransactionUnsupported(err) {
			logRepositoryError(ctx, "notification", "create.transaction", err, "collection", "notifications", "notification_id", notification.ID.Hex())
			return err
		}
		logRepositoryWarn(ctx, "notification", "create.transaction_unsupported", err, "collection", "notifications", "notification_id", notification.ID.Hex())
		users, fallbackErr := n.insertNotificationWithRelations(ctx, notification)
		if fallbackErr != nil {
			logRepositoryError(ctx, "notification", "create.fallback_insert", fallbackErr, "collection", "notifications", "notification_id", notification.ID.Hex())
			return fallbackErr
		}
		recipients = users
	}

	if notification.SendEmail {
		for _, user := range recipients {
			go utils.SendNotificationMail(user, notification)
		}
	}

	return nil
}

func (n *notificationRepository) insertNotificationWithRelations(ctx context.Context, notification domain.Aviso) ([]domain.Usuario, error) {

	var userFilter bson.M
	if !notification.SendToAll {
		var author domain.Usuario
		err := n.UserCollection.FindOne(ctx, bson.M{"_id": notification.AuthorID}).Decode(&author)
		if err != nil {
			if err != mongo.ErrNoDocuments {
				logRepositoryError(ctx, "notification", "create.find_author", err, "collection", "usuarios", "author_id", notification.AuthorID.Hex(), "notification_id", notification.ID.Hex())
			}
			return nil, err
		}
		userFilter = bson.M{
			"institutionID": author.InstitutionID,
			"$or": []bson.M{
				{"is_active": true},
				{"is_active": bson.M{"$exists": false}},
			},
		}
		if author.InstitutionID.IsZero() {
			userFilter = bson.M{
				"$or": []bson.M{
					{"is_active": true},
					{"is_active": bson.M{"$exists": false}},
				},
			}
		}
	} else {
		userFilter = bson.M{}
	}

	cursor, err := n.UserCollection.Find(ctx, userFilter)
	if err != nil {
		logRepositoryError(ctx, "notification", "create.find_recipients", err, "collection", "usuarios", "notification_id", notification.ID.Hex())
		return nil, err
	}
	defer cursor.Close(ctx)

	relations := make([]interface{}, 0)
	recipients := make([]domain.Usuario, 0)
	for cursor.Next(ctx) {
		var user domain.Usuario
		if err := cursor.Decode(&user); err != nil {
			logRepositoryError(ctx, "notification", "create.decode_recipient", err, "collection", "usuarios", "notification_id", notification.ID.Hex())
			return nil, err
		}
		recipients = append(recipients, user)

		relations = append(relations, domain.NotificationPersonRelation{
			ID:             bson.NewObjectID(),
			NotificationID: notification.ID,
			PersonID:       user.ID,
			Read:           false,
			ReadAt:         time.Time{},
			Dismissed:      false,
		})

	}
	if err := cursor.Err(); err != nil {
		logRepositoryError(ctx, "notification", "create.recipients_cursor", err, "collection", "usuarios", "notification_id", notification.ID.Hex())
		return nil, err
	}

	_, err = n.NotificationsCollection.InsertOne(ctx, notification)
	if err != nil {
		logRepositoryError(ctx, "notification", "create.insert_notification", err, "collection", "notifications", "notification_id", notification.ID.Hex(), "recipients_count", len(recipients))
		return nil, err
	}

	if len(relations) > 0 {
		_, err = n.NotificationPersonRelationCollection.InsertMany(ctx, relations)
		if err != nil {
			logRepositoryError(ctx, "notification", "create.insert_relations", err, "collection", "notification_person_relations", "notification_id", notification.ID.Hex(), "relations_count", len(relations))
			return nil, err
		}
	}

	return recipients, nil
}

func isTransactionUnsupported(err error) bool {
	message := strings.ToLower(err.Error())
	return strings.Contains(message, "transaction numbers are only allowed") ||
		strings.Contains(message, "replica set") ||
		strings.Contains(message, "transactions are not supported")
}

// DeleteNotification elimina una notificación por su ID.
// Convierte el ID de cadena a ObjectID y elimina el documento correspondiente de la colección.
func (n *notificationRepository) DeleteNotification(ctx context.Context, notificationID string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(notificationID)
	if err != nil {
		return errors.New("ID de notificación inválido")
	}
	_, err = n.NotificationsCollection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		logRepositoryError(ctx, "notification", "delete.delete_one", err, "collection", "notifications", "notification_id", notificationID)
	}
	return err
}

// UpdateNotification actualiza una notificación existente en la base de datos.
// Recibe un mapa de datos a actualizar, verifica el ID de la notificación y actualiza los campos correspondientes.
func (n *notificationRepository) UpdateNotification(ctx context.Context, data map[string]interface{}) (domain.Aviso, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	idStr, ok := data["_id"].(string)
	if !ok {
		return domain.Aviso{}, errors.New("ID de notificación no proporcionado o inválido")
	}
	objID, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return domain.Aviso{}, errors.New("ID de notificación inválido")
	}
	delete(data, "_id")

	allowedFields := map[string]bool{
		"description": true, "send_email": true, "send_to_all": true,
	}
	filtered := make(map[string]interface{})
	for k, v := range data {
		if allowedFields[k] {
			filtered[k] = v
		}
	}

	update := bson.M{"$set": filtered}
	_, err = n.NotificationsCollection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		logRepositoryError(ctx, "notification", "update.update_one", err, "collection", "notifications", "notification_id", idStr)
		return domain.Aviso{}, err
	}

	var updatedNotification domain.Aviso
	err = n.NotificationsCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&updatedNotification)
	if err != nil {
		logRepositoryError(ctx, "notification", "update.find_updated", err, "collection", "notifications", "notification_id", idStr)
		return domain.Aviso{}, err
	}
	return updatedNotification, nil
}

// GetNotifications obtiene todas las notificaciones de la base de datos.
func (n *notificationRepository) GetNotifications(ctx context.Context) ([]domain.Aviso, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	cursor, err := n.NotificationsCollection.Find(ctx, bson.M{})
	if err != nil {
		logRepositoryError(ctx, "notification", "get_all.find", err, "collection", "notifications")
		return nil, err
	}
	defer cursor.Close(ctx)

	var notifications []domain.Aviso
	for cursor.Next(ctx) {
		var notification domain.Aviso
		if err := cursor.Decode(&notification); err != nil {
			logRepositoryError(ctx, "notification", "get_all.decode", err, "collection", "notifications")
			return nil, err
		}
		notifications = append(notifications, notification)
	}
	if err := cursor.Err(); err != nil {
		logRepositoryError(ctx, "notification", "get_all.cursor", err, "collection", "notifications")
		return nil, err
	}
	return notifications, nil
}

// FindByIDAndUserID busca una notificación por su ID y el ID del usuario.
// Convierte el ID de cadena a ObjectID y verifica si la notificación pertenece al usuario especificado.
func (n *notificationRepository) FindByIDAndUserID(ctx context.Context, id string, userID string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de evento de calendario inválido")
	}
	userObjID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("ID de usuario inválido")
	}

	var aviso domain.Aviso
	filter := bson.M{"_id": objID, "author_id": userObjID}
	err = n.NotificationsCollection.FindOne(ctx, filter).Decode(&aviso)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return errors.New("evento no encontrado o no autorizado")
		}
		logRepositoryError(ctx, "notification", "find_by_id_and_user.find_one", err, "collection", "notifications", "notification_id", id, "user_id", userID)
		return err
	}
	return nil
}

// GetUnreadNotifications obtiene las notificaciones no leídas de un usuario específico.
// Recibe el ID del usuario, busca las relaciones de notificaciones con personas y retorna las notificaciones no leídas.
func (n *notificationRepository) GetUnreadNotifications(ctx context.Context, userID string) ([]domain.Aviso, error) {
	return n.getNotificationsByReadStatus(ctx, userID, false)
}

// GetReadNotifications obtiene las notificaciones leídas de un usuario específico.
// Recibe el ID del usuario, busca las relaciones de notificaciones con personas y retorna las notificaciones leídas.
func (n *notificationRepository) GetReadNotifications(ctx context.Context, userID string) ([]domain.Aviso, error) {
	return n.getNotificationsByReadStatus(ctx, userID, true)
}

func (n *notificationRepository) getNotificationsByReadStatus(ctx context.Context, userID string, read bool) ([]domain.Aviso, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()
	userObjID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("ID de usuario inválido")
	}

	cursor, err := n.NotificationPersonRelationCollection.Find(
		ctx,
		bson.M{"person_id": userObjID, "read": read, "dismissed": false},
	)
	if err != nil {
		logRepositoryError(ctx, "notification", "get_by_read_status.find_relations", err, "collection", "notification_person_relations", "user_id", userID, "read", read)
		return nil, err
	}
	defer cursor.Close(ctx)

	notificationIDs := make([]bson.ObjectID, 0)
	for cursor.Next(ctx) {
		var rel domain.NotificationPersonRelation
		if err := cursor.Decode(&rel); err != nil {
			logRepositoryWarn(ctx, "notification", "get_by_read_status.decode_relation", err, "collection", "notification_person_relations", "user_id", userID, "read", read)
			continue
		}
		notificationIDs = append(notificationIDs, rel.NotificationID)
	}
	if err := cursor.Err(); err != nil {
		logRepositoryError(ctx, "notification", "get_by_read_status.relations_cursor", err, "collection", "notification_person_relations", "user_id", userID, "read", read)
		return nil, err
	}
	if len(notificationIDs) == 0 {
		return []domain.Aviso{}, nil
	}

	notificationCursor, err := n.NotificationsCollection.Find(ctx, bson.M{"_id": bson.M{"$in": notificationIDs}})
	if err != nil {
		logRepositoryError(ctx, "notification", "get_by_read_status.find_notifications", err, "collection", "notifications", "user_id", userID, "read", read, "notification_ids_count", len(notificationIDs))
		return nil, err
	}
	defer notificationCursor.Close(ctx)

	var notifications []domain.Aviso
	if err := notificationCursor.All(ctx, &notifications); err != nil {
		logRepositoryError(ctx, "notification", "get_by_read_status.notifications_cursor_all", err, "collection", "notifications", "user_id", userID, "read", read, "notification_ids_count", len(notificationIDs))
		return nil, err
	}
	return notifications, nil
}

// MarkNotificationAsRead marca una notificación como leída para un usuario específico.
// Recibe el ID de la notificación y el ID del usuario, actualiza el estado de la notificación y la fecha de lectura.
func (n *notificationRepository) MarkNotificationAsRead(ctx context.Context, notificationID string, userID string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	notifObjID, err := bson.ObjectIDFromHex(notificationID)
	if err != nil {
		return errors.New("ID de notificación inválido")
	}
	userObjID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("ID de usuario inválido")
	}

	filter := bson.M{
		"notification_id": notifObjID,
		"person_id":       userObjID,
	}
	update := bson.M{
		"$set": bson.M{
			"read":    true,
			"read_at": time.Now(),
		},
	}
	_, err = n.NotificationPersonRelationCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		logRepositoryError(ctx, "notification", "mark_read.update_one", err, "collection", "notification_person_relations", "notification_id", notificationID, "user_id", userID)
	}
	return err
}

// DismissNotification oculta una notificación para un usuario específico (solo de su vista).
// Recibe el ID de la notificación y el ID del usuario, marca dismissed=true en la relación.
func (n *notificationRepository) DismissNotification(ctx context.Context, notificationID string, userID string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	notifObjID, err := bson.ObjectIDFromHex(notificationID)
	if err != nil {
		return errors.New("ID de notificación inválido")
	}
	userObjID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("ID de usuario inválido")
	}

	filter := bson.M{
		"notification_id": notifObjID,
		"person_id":       userObjID,
	}
	update := bson.M{
		"$set": bson.M{
			"dismissed": true,
		},
	}
	_, err = n.NotificationPersonRelationCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		logRepositoryError(ctx, "notification", "dismiss.update_one", err, "collection", "notification_person_relations", "notification_id", notificationID, "user_id", userID)
	}
	return err
}
