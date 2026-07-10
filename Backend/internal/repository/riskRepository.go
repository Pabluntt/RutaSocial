package repository

import (
	"context"
	"errors"
	"github.com/Pabluntt/RutaSocial/Backend/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"time"
)

// RiskRepository define la interfaz para las operaciones relacionadas con riesgos.
// Contiene métodos para obtener, crear, eliminar y actualizar riesgos.
type RiskRepository interface {
	GetRisks(ctx context.Context) ([]domain.Riesgo, error)
	CreateRisk(ctx context.Context, risk domain.Riesgo) (domain.Riesgo, error)
	DeleteRisk(ctx context.Context, id string) error
	UpdateRisk(ctx context.Context, updateData map[string]interface{}) (domain.Riesgo, error)
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
func (r *riskRepository) GetRisks(ctx context.Context) ([]domain.Riesgo, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	cursor, err := r.RiskCollection.Find(ctx, bson.M{})
	if err != nil {
		logRepositoryError(ctx, "risk", "get_all.find", err, "collection", "risks")
		return nil, err
	}
	defer cursor.Close(ctx)

	var risks []domain.Riesgo
	for cursor.Next(ctx) {
		var risk domain.Riesgo
		if err := cursor.Decode(&risk); err != nil {
			logRepositoryError(ctx, "risk", "get_all.decode", err, "collection", "risks")
			return nil, err
		}
		risks = append(risks, risk)
	}
	if err := cursor.Err(); err != nil {
		logRepositoryError(ctx, "risk", "get_all.cursor", err, "collection", "risks")
		return nil, err
	}
	return risks, nil
}

// CreateRisk crea un nuevo riesgo en la base de datos.
// Asigna un ID y una fecha de registro al riesgo.
func (r *riskRepository) CreateRisk(ctx context.Context, risk domain.Riesgo) (domain.Riesgo, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	risk.ID = bson.NewObjectID()
	risk.DateRegister = time.Now()
	_, err := r.RiskCollection.InsertOne(ctx, risk)
	if err != nil {
		logRepositoryError(ctx, "risk", "create.insert_one", err, "collection", "risks", "risk_id", risk.ID.Hex())
	}
	return risk, err
}

// DeleteRisk elimina un riesgo de la base de datos por su ID.
// Recibe el ID como string, lo convierte a ObjectID y elimina el documento correspondiente.
func (r *riskRepository) DeleteRisk(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de riesgo inválido")
	}
	_, err = r.RiskCollection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		logRepositoryError(ctx, "risk", "delete.delete_one", err, "collection", "risks", "risk_id", id)
	}
	return err
}

// UpdateRisk actualiza un riesgo en la base de datos.
// Recibe un mapa de datos a actualizar, verifica el ID del riesgo y actualiza los campos correspondientes.
func (r *riskRepository) UpdateRisk(ctx context.Context, updateData map[string]interface{}) (domain.Riesgo, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	idStr, ok := updateData["_id"].(string)
	if !ok {
		return domain.Riesgo{}, errors.New("ID de riesgo no proporcionado o inválido")
	}
	objID, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return domain.Riesgo{}, errors.New("ID de riesgo inválido")
	}
	delete(updateData, "_id")

	allowedFields := map[string]bool{
		"description": true, "Status": true,
	}
	filtered := make(map[string]interface{})
	for k, v := range updateData {
		if allowedFields[k] {
			filtered[k] = v
		}
	}

	update := bson.M{"$set": filtered}
	_, err = r.RiskCollection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		logRepositoryError(ctx, "risk", "update.update_one", err, "collection", "risks", "risk_id", idStr)
		return domain.Riesgo{}, err
	}

	var updatedRisk domain.Riesgo
	err = r.RiskCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&updatedRisk)
	if err != nil {
		logRepositoryError(ctx, "risk", "update.find_updated", err, "collection", "risks", "risk_id", idStr)
		return domain.Riesgo{}, err
	}
	return updatedRisk, nil
}
