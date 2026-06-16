package repository

import (
	"context"
	"errors"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"time"
)

// InstitutionRepository define la interfaz para las operaciones relacionadas con instituciones.
// Contiene métodos para obtener, crear, actualizar y eliminar instituciones.
type InstitutionRepository interface {
	GetAllInstitutions() ([]domain.Institution, error)
	GetInstitutionByID(id string) (domain.Institution, error)
	CreateInstitution(institution domain.Institution) error
	UpdateInstitution(id string, updateData map[string]interface{}) error
	DeleteInstitution(id string) error
}

// institutionRepository implementa la interfaz InstitutionRepository.
// Contiene una colección de instituciones para interactuar con la base de datos.
type institutionRepository struct {
	InstitutionCollection *mongo.Collection
}

// NewInstitutionRepository crea una nueva instancia de institutionRepository.
// Recibe una colección de instituciones y retorna una instancia de InstitutionRepository.
func NewInstitutionRepository(InstitutionCollection *mongo.Collection) InstitutionRepository {
	return &institutionRepository{
		InstitutionCollection: InstitutionCollection,
	}
}

// GetAllInstitutions obtiene todas las instituciones de la base de datos.
// Retorna un slice de instituciones o un error si ocurre algún problema.
func (i *institutionRepository) GetAllInstitutions() ([]domain.Institution, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var institutions []domain.Institution

	cursor, err := i.InstitutionCollection.Find(ctx, bson.D{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &institutions); err != nil {
		return nil, err
	}

	return institutions, nil
}

// GetInstitutionByID obtiene una institución por su ID.
// Recibe el ID como string, lo convierte a ObjectID y busca en la colección.
func (i *institutionRepository) GetInstitutionByID(id string) (domain.Institution, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var institution domain.Institution

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return institution, err
	}

	filter := bson.D{{"_id", objectID}}
	err = i.InstitutionCollection.FindOne(ctx, filter).Decode(&institution)
	if err != nil {
		return institution, err
	}

	return institution, nil
}

// CreateInstitution crea una nueva institución en la base de datos.
// Asigna un nuevo ID a la institución y la inserta en la colección.
func (i *institutionRepository) CreateInstitution(institution domain.Institution) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	institution.ID = bson.NewObjectID()
	_, err := i.InstitutionCollection.InsertOne(ctx, institution)
	return err
}

// UpdateInstitution actualiza una institución existente en la base de datos.
// Recibe el ID de la institución y un mapa de datos a actualizar.
func (i *institutionRepository) UpdateInstitution(id string, updateData map[string]interface{}) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de institución inválido")
	}

	allowedFields := map[string]bool{
		"name": true, "color": true,
	}
	filtered := make(map[string]interface{})
	for k, v := range updateData {
		if allowedFields[k] {
			filtered[k] = v
		}
	}

	update := bson.M{"$set": filtered}
	_, err = i.InstitutionCollection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	return err
}

// DeleteInstitution elimina una institución por su ID.
// Convierte el ID de cadena a ObjectID y elimina el documento correspondiente de la colección.
func (i *institutionRepository) DeleteInstitution(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	filter := bson.D{{"_id", objectID}}
	_, err = i.InstitutionCollection.DeleteOne(ctx, filter)
	return err
}
