package repository

import (
	"context"
	"errors"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"time"
)

// RiskRepository define la interfaz para las operaciones relacionadas con riesgos.
// Contiene métodos para obtener, crear, eliminar y actualizar riesgos.
type RiskRepository interface {
	GetRisks() ([]domain.Riesgo, error)
	CreateRisk(risk domain.Riesgo) error
	DeleteRisk(id string) error
	UpdateRisk(updateData map[string]interface{}) (domain.Riesgo, error)
}

// riskRepository implementa la interfaz RiskRepository.
// Contiene una colección de riesgos para interactuar con la base de datos.
type riskRepository struct {
	RiskCollection *mongo.Collection
}

// NewRiskRepository crea una nueva instancia de riskRepository.
// Recibe una colección de riesgos y retorna una instancia de RiskRepository.
func NewRiskRepository(riskCollection *mongo.Collection) RiskRepository {
	return &riskRepository{
		RiskCollection: riskCollection,
	}
}

// GetRisks obtiene todos los riesgos de la base de datos.
// Retorna un slice de riesgos o un error si ocurre algún problema.
func (r *riskRepository) GetRisks() ([]domain.Riesgo, error) {
	cursor, err := r.RiskCollection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var risks []domain.Riesgo
	for cursor.Next(context.Background()) {
		var risk domain.Riesgo
		if err := cursor.Decode(&risk); err != nil {
			return nil, err
		}
		risks = append(risks, risk)
	}
	return risks, nil
}

// CreateRisk crea un nuevo riesgo en la base de datos.
// Asigna un ID y una fecha de registro al riesgo.
func (r *riskRepository) CreateRisk(risk domain.Riesgo) error {
	risk.ID = bson.NewObjectID()
	risk.DateRegister = time.Now()
	_, err := r.RiskCollection.InsertOne(context.Background(), risk)
	return err
}

// DeleteRisk elimina un riesgo de la base de datos por su ID.
// Recibe el ID como string, lo convierte a ObjectID y elimina el documento correspondiente.
func (r *riskRepository) DeleteRisk(id string) error {
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de riesgo inválido")
	}
	_, err = r.RiskCollection.DeleteOne(context.Background(), bson.M{"_id": objID})
	return err
}

// UpdateRisk actualiza un riesgo en la base de datos.
// Recibe un mapa de datos a actualizar, verifica el ID del riesgo y actualiza los campos correspondientes.
func (r *riskRepository) UpdateRisk(updateData map[string]interface{}) (domain.Riesgo, error) {
	idStr, ok := updateData["_id"].(string)
	if !ok {
		return domain.Riesgo{}, errors.New("ID de riesgo no proporcionado o inválido")
	}
	objID, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return domain.Riesgo{}, errors.New("ID de riesgo inválido")
	}
	delete(updateData, "_id")

	update := bson.M{"$set": updateData}
	_, err = r.RiskCollection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		return domain.Riesgo{}, err
	}

	var updatedRisk domain.Riesgo
	err = r.RiskCollection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&updatedRisk)
	if err != nil {
		return domain.Riesgo{}, err
	}
	return updatedRisk, nil
}
