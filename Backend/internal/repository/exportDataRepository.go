package repository

import (
	"context"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// ExportDataRepository define la interfaz para las operaciones de exportación de datos.
// Contiene el metodo para obtener datos de personas ayudadas que son utilizados para la exportación de datos en formato excel.
type ExportDataRepository interface {
	GetPeopleHelpedData() ([]domain.PersonaAyudada, error)
}

// exportDataRepository implementa la interfaz ExportDataRepository.
// Contiene una colección de personas ayudadas para interactuar con la base de datos.
type exportDataRepository struct {
	PeopleHelpedCollection *mongo.Collection
}

// NewExportDataRepository crea una nueva instancia de exportDataRepository.
// Recibe una colección de personas ayudadas y retorna una instancia de ExportDataRepository.
func NewExportDataRepository(collection *mongo.Collection) ExportDataRepository {
	return &exportDataRepository{
		PeopleHelpedCollection: collection,
	}
}

// GetPeopleHelpedData obtiene los datos de personas ayudadas de la base de datos.
// Retorna un slice de personas ayudadas o un error si ocurre algún problema.
func (ed *exportDataRepository) GetPeopleHelpedData() ([]domain.PersonaAyudada, error) {
	cursor, err := ed.PeopleHelpedCollection.Find(context.Background(), bson.M{})
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
