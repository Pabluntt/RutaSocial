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
	GetPeopleHelped() ([]domain.PersonaAyudada, error)
	CreatePersonHelped(person domain.PersonaAyudada) error
	DeletePersonHelped(id string) error
	UpdatePersonHelped(updateData map[string]interface{}) (domain.PersonaAyudada, error)
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
func (ph *peopleHelpedRepository) GetPeopleHelped() ([]domain.PersonaAyudada, error) {
	cursor, err := ph.PeopleHelpedCollections.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var peopleHelped []domain.PersonaAyudada
	for cursor.Next(context.Background()) {
		var person domain.PersonaAyudada
		if err := cursor.Decode(&person); err != nil {
			return nil, err
		}
		peopleHelped = append(peopleHelped, person)
	}
	return peopleHelped, nil
}

// CreatePersonHelped crea una nueva persona ayudada en la base de datos.
// Asigna un ID y una fecha de registro a la persona ayudada.
func (ph *peopleHelpedRepository) CreatePersonHelped(person domain.PersonaAyudada) error {
	person.ID = bson.NewObjectID()
	person.DateRegister = time.Now()
	_, err := ph.PeopleHelpedCollections.InsertOne(context.Background(), person)
	return err
}

// DeletePersonHelped elimina una persona ayudada de la base de datos.
// Recibe el ID de la persona ayudada como string, lo convierte a ObjectID y elimina el documento correspondiente.
func (ph *peopleHelpedRepository) DeletePersonHelped(id string) error {
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de persona ayudada inválido")
	}
	_, err = ph.PeopleHelpedCollections.DeleteOne(context.Background(), bson.M{"_id": objID})
	return err
}

// UpdatePersonHelped actualiza una persona ayudada en la base de datos.
// Recibe un mapa de datos a actualizar, verifica el ID de la persona ayudada y actualiza los campos correspondientes.
func (ph *peopleHelpedRepository) UpdatePersonHelped(updateData map[string]interface{}) (domain.PersonaAyudada, error) {
	idStr, ok := updateData["_id"].(string)
	if !ok {
		return domain.PersonaAyudada{}, errors.New("ID de persona ayudada no proporcionado o inválido")
	}
	objID, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return domain.PersonaAyudada{}, errors.New("ID de persona ayudada inválido")
	}
	delete(updateData, "_id")

	update := bson.M{"$set": updateData}
	_, err = ph.PeopleHelpedCollections.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		return domain.PersonaAyudada{}, err
	}

	var updatedPerson domain.PersonaAyudada
	err = ph.PeopleHelpedCollections.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&updatedPerson)
	if err != nil {
		return domain.PersonaAyudada{}, err
	}

	_, err = ph.HelpPointCollection.UpdateOne(
		context.Background(),
		bson.M{"peopleHelped._id": objID},
		bson.M{"$set": bson.M{"peopleHelped.$": updatedPerson}},
	)
	if err != nil {
		return domain.PersonaAyudada{}, err
	}

	return updatedPerson, nil
}
