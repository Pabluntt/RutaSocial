package repository

import (
	"context"
	"github.com/Pabluntt/RutaSocial/Backend/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"time"
)

// ExportDataRepository define la interfaz para las operaciones de exportación de datos.
// Contiene el metodo para obtener datos de personas ayudadas que son utilizados para la exportación de datos en formato excel.
type ExportDataRepository interface {
	GetPeopleHelpedData(ctx context.Context) ([]domain.PersonaAyudada, error)
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
func (ed *exportDataRepository) GetPeopleHelpedData(ctx context.Context) ([]domain.PersonaAyudada, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	cursor, err := ed.PeopleHelpedCollection.Find(ctx, bson.M{})
	if err != nil {
		logRepositoryError(ctx, "export_data", "get_people_helped.find", err, "collection", "people_helped")
		return nil, err
	}
	defer cursor.Close(ctx)

	var peopleHelped []domain.PersonaAyudada
	for cursor.Next(ctx) {
		var person domain.PersonaAyudada
		if err := cursor.Decode(&person); err != nil {
			logRepositoryError(ctx, "export_data", "get_people_helped.decode", err, "collection", "people_helped")
			return nil, err
		}
		peopleHelped = append(peopleHelped, person)
	}
	if err := cursor.Err(); err != nil {
		logRepositoryError(ctx, "export_data", "get_people_helped.cursor", err, "collection", "people_helped")
		return nil, err
	}
	return peopleHelped, nil
}
