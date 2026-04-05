package repository

import (
	"context"
	"errors"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// CalendarEventRepository define la interfaz para las operaciones relacionadas con eventos de calendario.
// Contiene métodos para obtener, crear, eliminar, actualizar eventos de calendario y buscar por ID y usuario.
type CalendarEventRepository interface {
	GetAllCalendarEvents() ([]domain.EventoCalendario, error)
	CreateCalendarEvent(event domain.EventoCalendario, userID string) error
	DeleteCalendarEvent(id string) error
	UpdateCalendarEvent(updateData map[string]interface{}) (domain.EventoCalendario, error)
	FindByIDAndUserID(id string, userID string) error
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

// GetAllCalendarEvents obtiene todos los eventos de calendario de la base de datos.
// Retorna un slice de eventos de calendario o un error si ocurre algún problema.
func (c calendarEventRepository) GetAllCalendarEvents() ([]domain.EventoCalendario, error) {
	var events []domain.EventoCalendario
	cursor, err := c.CalendarEventCollection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var event domain.EventoCalendario
		if err := cursor.Decode(&event); err != nil {
			return nil, err
		}
		events = append(events, event)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return events, nil
}

// CreateCalendarEvent crea un nuevo evento de calendario en la base de datos.
// Asigna un nuevo ID al evento, establece el ID del autor y lo inserta en la colección.
func (c calendarEventRepository) CreateCalendarEvent(event domain.EventoCalendario, userID string) error {
	event.ID = bson.NewObjectID()
	event.AuthorID, _ = bson.ObjectIDFromHex(userID)
	_, err := c.CalendarEventCollection.InsertOne(context.Background(), event)
	return err
}

// DeleteCalendarEvent elimina un evento de calendario por su ID.
// Convierte el ID de cadena a ObjectID y elimina el documento correspondiente de la colección.
func (c calendarEventRepository) DeleteCalendarEvent(id string) error {
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de punto de ayuda inválido")
	}
	_, err = c.CalendarEventCollection.DeleteOne(context.Background(), bson.M{"_id": objID})
	return err
}

// UpdateCalendarEvent actualiza un evento de calendario existente en la base de datos.
// Recibe un mapa de datos a actualizar, extrae el ID del evento y realiza la actualización en la colección.
func (c calendarEventRepository) UpdateCalendarEvent(updateData map[string]interface{}) (domain.EventoCalendario, error) {
	idStr, ok := updateData["_id"].(string)
	if !ok {
		return domain.EventoCalendario{}, errors.New("ID de evento de calendario no proporcionado o inválido")
	}
	objID, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return domain.EventoCalendario{}, errors.New("ID de evento de calendario inválido")
	}
	delete(updateData, "_id")

	update := bson.M{"$set": updateData}
	_, err = c.CalendarEventCollection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		return domain.EventoCalendario{}, err
	}

	var updatedEvent domain.EventoCalendario
	err = c.CalendarEventCollection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&updatedEvent)
	if err != nil {
		return domain.EventoCalendario{}, err
	}
	return updatedEvent, nil
}

// FindByIDAndUserID busca un evento de calendario por su ID y el ID del usuario.
// Convierte el ID de cadena a ObjectID y verifica si el evento pertenece al usuario especificado.
func (c calendarEventRepository) FindByIDAndUserID(id string, userID string) error {
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de evento de calendario inválido")
	}

	var event domain.EventoCalendario
	filter := bson.M{"_id": objID, "author_id": userID}
	err = c.CalendarEventCollection.FindOne(context.Background(), filter).Decode(&event)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return errors.New("evento no encontrado o no autorizado")
		}
		return err
	}
	return nil
}
