package repository

import (
	"context"
	"errors"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"time"
)

// PeopleHelpedRepository define la interfaz para las operaciones relacionadas con personas ayudadas.
// Contiene métodos para obtener, crear, eliminar y actualizar personas ayudadas.
// Este archivo está "obsoleto" como se mencionó en varios archivos, ya que se ha cambiado el nombre de la entidad a "PersonaAyudada".
type PeopleHelpedRepository interface {
	GetPeopleHelped(ctx context.Context) ([]domain.PersonaAyudada, error)
	CreatePersonHelped(ctx context.Context, person domain.PersonaAyudada) error
	DeletePersonHelped(ctx context.Context, id string) error
	UpdatePersonHelped(ctx context.Context, updateData map[string]interface{}) (domain.PersonaAyudada, error)
}

// peopleHelpedRepository implementa la interfaz PeopleHelpedRepository.
// Contiene colecciones de puntos de ayuda y personas ayudadas para interactuar con la base de datos.
type peopleHelpedRepository struct {
	HelpPointCollection     *mongo.Collection
	PeopleHelpedCollections *mongo.Collection
}

// NewPeopleHelpedRepository crea una nueva instancia de peopleHelpedRepository.
// Recibe colecciones de puntos de ayuda y personas ayudadas y retorna una instancia de PeopleHelpedRepository.
func NewPeopleHelpedRepository(helpPointCollection *mongo.Collection, peopleHelpedCollection *mongo.Collection) PeopleHelpedRepository {
	return &peopleHelpedRepository{
		HelpPointCollection:     helpPointCollection,
		PeopleHelpedCollections: peopleHelpedCollection,
	}
}

// GetPeopleHelped obtiene todas las personas ayudadas de la base de datos.
// Retorna un slice de personas ayudadas o un error si ocurre algún problema.
func (ph *peopleHelpedRepository) GetPeopleHelped(ctx context.Context) ([]domain.PersonaAyudada, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	cursor, err := ph.PeopleHelpedCollections.Find(ctx, bson.M{})
	if err != nil {
		logRepositoryError(ctx, "people_helped", "get_all.find", err, "collection", "people_helped")
		return nil, err
	}
	defer cursor.Close(ctx)

	var peopleHelped []domain.PersonaAyudada
	for cursor.Next(ctx) {
		var person domain.PersonaAyudada
		if err := cursor.Decode(&person); err != nil {
			logRepositoryError(ctx, "people_helped", "get_all.decode", err, "collection", "people_helped")
			return nil, err
		}
		peopleHelped = append(peopleHelped, person)
	}
	if err := cursor.Err(); err != nil {
		logRepositoryError(ctx, "people_helped", "get_all.cursor", err, "collection", "people_helped")
		return nil, err
	}
	return peopleHelped, nil
}

// CreatePersonHelped crea una nueva persona ayudada en la base de datos.
// Asigna un ID y una fecha de registro a la persona ayudada.
func (ph *peopleHelpedRepository) CreatePersonHelped(ctx context.Context, person domain.PersonaAyudada) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	person.ID = bson.NewObjectID()
	person.DateRegister = time.Now()
	_, err := ph.PeopleHelpedCollections.InsertOne(ctx, person)
	if err != nil {
		logRepositoryError(ctx, "people_helped", "create.insert_one", err, "collection", "people_helped", "person_id", person.ID.Hex())
	}
	return err
}

// DeletePersonHelped elimina una persona ayudada de la base de datos.
// Recibe el ID de la persona ayudada como string, lo convierte a ObjectID y elimina el documento correspondiente.
func (ph *peopleHelpedRepository) DeletePersonHelped(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de persona ayudada inválido")
	}
	_, err = ph.PeopleHelpedCollections.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		logRepositoryError(ctx, "people_helped", "delete.delete_one", err, "collection", "people_helped", "person_id", id)
	}
	return err
}

// UpdatePersonHelped actualiza una persona ayudada en la base de datos.
// Recibe un mapa de datos a actualizar, verifica el ID de la persona ayudada y actualiza los campos correspondientes.
func (ph *peopleHelpedRepository) UpdatePersonHelped(ctx context.Context, updateData map[string]interface{}) (domain.PersonaAyudada, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	idStr, ok := updateData["_id"].(string)
	if !ok {
		return domain.PersonaAyudada{}, errors.New("ID de persona ayudada no proporcionado o inválido")
	}
	objID, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return domain.PersonaAyudada{}, errors.New("ID de persona ayudada inválido")
	}
	delete(updateData, "_id")

	allowedFields := map[string]bool{
		"age": true, "gender": true, "name": true, "rut": true,
	}
	filtered := make(map[string]interface{})
	for k, v := range updateData {
		if allowedFields[k] {
			filtered[k] = v
		}
	}

	update := bson.M{"$set": filtered}
	_, err = ph.PeopleHelpedCollections.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		logRepositoryError(ctx, "people_helped", "update.update_one", err, "collection", "people_helped", "person_id", idStr)
		return domain.PersonaAyudada{}, err
	}

	var updatedPerson domain.PersonaAyudada
	err = ph.PeopleHelpedCollections.FindOne(ctx, bson.M{"_id": objID}).Decode(&updatedPerson)
	if err != nil {
		logRepositoryError(ctx, "people_helped", "update.find_updated", err, "collection", "people_helped", "person_id", idStr)
		return domain.PersonaAyudada{}, err
	}

	_, err = ph.HelpPointCollection.UpdateOne(
		ctx,
		bson.M{"peopleHelped._id": objID},
		bson.M{"$set": bson.M{"peopleHelped.$": updatedPerson}},
	)
	if err != nil {
		logRepositoryError(ctx, "people_helped", "update.sync_help_point", err, "collection", "help_points", "person_id", idStr)
		return domain.PersonaAyudada{}, err
	}

	return updatedPerson, nil
}
