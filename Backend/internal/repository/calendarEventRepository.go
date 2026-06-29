package repository

import (
	"context"
	"errors"
	"time"

	"github.com/SebaVCH/hdcProject/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// CalendarEventRepository define la interfaz para las operaciones relacionadas con eventos de calendario.
// Contiene métodos para obtener, crear, eliminar, actualizar eventos de calendario y buscar por ID y usuario.
type CalendarEventRepository interface {
	GetAllCalendarEvents(ctx context.Context) ([]domain.EventoCalendario, error)
	CreateCalendarEvent(ctx context.Context, event domain.EventoCalendario, userID string) (domain.EventoCalendario, error)
	DeleteCalendarEvent(ctx context.Context, id string) error
	UpdateCalendarEvent(ctx context.Context, updateData map[string]interface{}) (domain.EventoCalendario, error)
	FindByIDAndUserID(ctx context.Context, id string, userID string) error
	GetCalendarEventsByUserID(ctx context.Context, userID string) ([]domain.EventoCalendario, error)
}

// calendarEventRepository implementa la interfaz CalendarEventRepository.
// Contiene una colección de eventos de calendario para interactuar con la base de datos.
type calendarEventRepository struct {
	CalendarEventCollection *mongo.Collection
}

// NewCalendarEventRepository crea una nueva instancia de calendarEventRepository.
// Recibe una colección de eventos de calendario y retorna una instancia de CalendarEventRepository.
func NewCalendarEventRepository(calendarEventCollection *mongo.Collection) CalendarEventRepository {
	return &calendarEventRepository{
		CalendarEventCollection: calendarEventCollection,
	}
}

// GetCalendarEventsByUserID obtiene todos los eventos de calendario de un usuario por su ID.
func (c calendarEventRepository) GetCalendarEventsByUserID(ctx context.Context, userID string) ([]domain.EventoCalendario, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	userObjID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("ID de usuario inválido")
	}

	cursor, err := c.CalendarEventCollection.Find(ctx, bson.M{"author_id": userObjID})
	if err != nil {
		logRepositoryError(ctx, "calendar_event", "get_by_user.find", err, "collection", "calendar_events", "user_id", userID)
		return nil, err
	}
	defer cursor.Close(ctx)

	var events []domain.EventoCalendario
	if err := cursor.All(ctx, &events); err != nil {
		logRepositoryError(ctx, "calendar_event", "get_by_user.cursor_all", err, "collection", "calendar_events", "user_id", userID)
		return nil, err
	}
	return events, nil
}

// GetAllCalendarEvents obtiene todos los eventos de calendario de la base de datos.
// Retorna un slice de eventos de calendario o un error si ocurre algún problema.
func (c calendarEventRepository) GetAllCalendarEvents(ctx context.Context) ([]domain.EventoCalendario, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	var events []domain.EventoCalendario
	cursor, err := c.CalendarEventCollection.Find(ctx, bson.M{})
	if err != nil {
		logRepositoryError(ctx, "calendar_event", "get_all.find", err, "collection", "calendar_events")
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var event domain.EventoCalendario
		if err := cursor.Decode(&event); err != nil {
			logRepositoryError(ctx, "calendar_event", "get_all.decode", err, "collection", "calendar_events")
			return nil, err
		}
		events = append(events, event)
	}

	if err := cursor.Err(); err != nil {
		logRepositoryError(ctx, "calendar_event", "get_all.cursor", err, "collection", "calendar_events")
		return nil, err
	}

	return events, nil
}

// CreateCalendarEvent crea un nuevo evento de calendario en la base de datos.
// Asigna un nuevo ID al evento, establece el ID del autor y lo inserta en la colección.
// Si RouteID es el valor cero de ObjectID, se omite para evitar guardar ObjectID("000000000000000000000000") en MongoDB.
// Retorna el evento creado con su ID real asignado por MongoDB.
func (c calendarEventRepository) CreateCalendarEvent(ctx context.Context, event domain.EventoCalendario, userID string) (domain.EventoCalendario, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	event.ID = bson.NewObjectID()
	userObjID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return domain.EventoCalendario{}, errors.New("ID de usuario inválido")
	}
	event.AuthorID = userObjID

	data, err := bson.Marshal(event)
	if err != nil {
		logRepositoryError(ctx, "calendar_event", "create.marshal", err, "user_id", userID, "event_id", event.ID.Hex())
		return domain.EventoCalendario{}, err
	}

	var doc bson.M
	err = bson.Unmarshal(data, &doc)
	if err != nil {
		logRepositoryError(ctx, "calendar_event", "create.unmarshal", err, "user_id", userID, "event_id", event.ID.Hex())
		return domain.EventoCalendario{}, err
	}

	if event.RouteID.IsZero() {
		delete(doc, "route_id")
	}

	_, err = c.CalendarEventCollection.InsertOne(ctx, doc)
	if err != nil {
		logRepositoryError(ctx, "calendar_event", "create.insert_one", err, "collection", "calendar_events", "user_id", userID, "event_id", event.ID.Hex())
		return domain.EventoCalendario{}, err
	}

	var created domain.EventoCalendario
	err = c.CalendarEventCollection.FindOne(ctx, bson.M{"_id": event.ID}).Decode(&created)
	if err != nil {
		logRepositoryError(ctx, "calendar_event", "create.find_created", err, "collection", "calendar_events", "user_id", userID, "event_id", event.ID.Hex())
		return domain.EventoCalendario{}, err
	}

	return created, nil
}

// DeleteCalendarEvent elimina un evento de calendario por su ID.
// Convierte el ID de cadena a ObjectID y elimina el documento correspondiente de la colección.
func (c calendarEventRepository) DeleteCalendarEvent(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de punto de ayuda inválido")
	}
	_, err = c.CalendarEventCollection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		logRepositoryError(ctx, "calendar_event", "delete.delete_one", err, "collection", "calendar_events", "event_id", id)
	}
	return err
}

// UpdateCalendarEvent actualiza un evento de calendario existente en la base de datos.
// Recibe un mapa de datos a actualizar, extrae el ID del evento y realiza la actualización en la colección.
func (c calendarEventRepository) UpdateCalendarEvent(ctx context.Context, updateData map[string]interface{}) (domain.EventoCalendario, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	idStr, ok := updateData["_id"].(string)
	if !ok {
		return domain.EventoCalendario{}, errors.New("ID de evento de calendario no proporcionado o inválido")
	}
	objID, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return domain.EventoCalendario{}, errors.New("ID de evento de calendario inválido")
	}
	delete(updateData, "_id")

	allowedFields := map[string]bool{
		"title": true, "description": true, "date_start": true,
		"time_start": true, "time_end": true, "route_id": true,
	}
	filtered := make(map[string]interface{})
	for k, v := range updateData {
		if allowedFields[k] {
			filtered[k] = v
		}
	}

	update := bson.M{"$set": filtered}
	_, err = c.CalendarEventCollection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		logRepositoryError(ctx, "calendar_event", "update.update_one", err, "collection", "calendar_events", "event_id", idStr)
		return domain.EventoCalendario{}, err
	}

	var updatedEvent domain.EventoCalendario
	err = c.CalendarEventCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&updatedEvent)
	if err != nil {
		logRepositoryError(ctx, "calendar_event", "update.find_updated", err, "collection", "calendar_events", "event_id", idStr)
		return domain.EventoCalendario{}, err
	}
	return updatedEvent, nil
}

// FindByIDAndUserID busca un evento de calendario por su ID y el ID del usuario.
// Convierte el ID de cadena a ObjectID y verifica si el evento pertenece al usuario especificado.
func (c calendarEventRepository) FindByIDAndUserID(ctx context.Context, id string, userID string) error {
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

	var event domain.EventoCalendario
	filter := bson.M{"_id": objID, "author_id": userObjID}
	err = c.CalendarEventCollection.FindOne(ctx, filter).Decode(&event)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return errors.New("evento no encontrado o no autorizado")
		}
		logRepositoryError(ctx, "calendar_event", "find_by_id_and_user.find_one", err, "collection", "calendar_events", "event_id", id, "user_id", userID)
		return err
	}
	return nil
}
