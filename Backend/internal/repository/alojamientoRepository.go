package repository

import (
	"context"
	"errors"
	"github.com/Pabluntt/RutaSocial/Backend/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"time"
)

type AlojamientoRepository interface {
	GetAlojamientos(ctx context.Context) ([]domain.Alojamiento, error)
	CreateAlojamiento(ctx context.Context, alojamiento domain.Alojamiento) error
	DeleteAlojamiento(ctx context.Context, id string) error
	UpdateAlojamiento(ctx context.Context, updateData map[string]interface{}) (domain.Alojamiento, error)
}

type alojamientoRepository struct {
	AlojamientoCollection *mongo.Collection
}

func NewAlojamientoRepository(alojamientoCollection *mongo.Collection) AlojamientoRepository {
	return &alojamientoRepository{
		AlojamientoCollection: alojamientoCollection,
	}
}

func (r *alojamientoRepository) GetAlojamientos(ctx context.Context) ([]domain.Alojamiento, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	cursor, err := r.AlojamientoCollection.Find(ctx, bson.M{})
	if err != nil {
		logRepositoryError(ctx, "alojamiento", "get_all.find", err, "collection", "alojamientos")
		return nil, err
	}
	defer cursor.Close(ctx)

	var alojamientos []domain.Alojamiento
	for cursor.Next(ctx) {
		var alojamiento domain.Alojamiento
		if err := cursor.Decode(&alojamiento); err != nil {
			logRepositoryError(ctx, "alojamiento", "get_all.decode", err, "collection", "alojamientos")
			return nil, err
		}
		alojamientos = append(alojamientos, alojamiento)
	}
	if err := cursor.Err(); err != nil {
		logRepositoryError(ctx, "alojamiento", "get_all.cursor", err, "collection", "alojamientos")
		return nil, err
	}
	return alojamientos, nil
}

func (r *alojamientoRepository) CreateAlojamiento(ctx context.Context, alojamiento domain.Alojamiento) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	alojamiento.ID = bson.NewObjectID()
	alojamiento.DateRegister = time.Now()
	_, err := r.AlojamientoCollection.InsertOne(ctx, alojamiento)
	if err != nil {
		logRepositoryError(ctx, "alojamiento", "create.insert_one", err, "collection", "alojamientos", "alojamiento_id", alojamiento.ID.Hex())
	}
	return err
}

func (r *alojamientoRepository) DeleteAlojamiento(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de alojamiento inválido")
	}
	_, err = r.AlojamientoCollection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		logRepositoryError(ctx, "alojamiento", "delete.delete_one", err, "collection", "alojamientos", "alojamiento_id", id)
	}
	return err
}

func (r *alojamientoRepository) UpdateAlojamiento(ctx context.Context, updateData map[string]interface{}) (domain.Alojamiento, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	idStr, ok := updateData["_id"].(string)
	if !ok {
		return domain.Alojamiento{}, errors.New("ID de alojamiento no proporcionado o inválido")
	}
	objID, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return domain.Alojamiento{}, errors.New("ID de alojamiento inválido")
	}
	delete(updateData, "_id")

	allowedFields := map[string]bool{
		"name": true, "cupos": true, "coords": true,
	}
	filtered := make(map[string]interface{})
	for k, v := range updateData {
		if allowedFields[k] {
			filtered[k] = v
		}
	}

	update := bson.M{"$set": filtered}
	_, err = r.AlojamientoCollection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		logRepositoryError(ctx, "alojamiento", "update.update_one", err, "collection", "alojamientos", "alojamiento_id", idStr)
		return domain.Alojamiento{}, err
	}

	var updatedAlojamiento domain.Alojamiento
	err = r.AlojamientoCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&updatedAlojamiento)
	if err != nil {
		logRepositoryError(ctx, "alojamiento", "update.find_updated", err, "collection", "alojamientos", "alojamiento_id", idStr)
		return domain.Alojamiento{}, err
	}
	return updatedAlojamiento, nil
}
