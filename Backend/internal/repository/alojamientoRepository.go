package repository

import (
	"context"
	"errors"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"time"
)

type AlojamientoRepository interface {
	GetAlojamientos() ([]domain.Alojamiento, error)
	CreateAlojamiento(alojamiento domain.Alojamiento) error
	DeleteAlojamiento(id string) error
	UpdateAlojamiento(updateData map[string]interface{}) (domain.Alojamiento, error)
}

type alojamientoRepository struct {
	AlojamientoCollection *mongo.Collection
}

func NewAlojamientoRepository(alojamientoCollection *mongo.Collection) AlojamientoRepository {
	return &alojamientoRepository{
		AlojamientoCollection: alojamientoCollection,
	}
}

func (r *alojamientoRepository) GetAlojamientos() ([]domain.Alojamiento, error) {
	cursor, err := r.AlojamientoCollection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var alojamientos []domain.Alojamiento
	for cursor.Next(context.Background()) {
		var alojamiento domain.Alojamiento
		if err := cursor.Decode(&alojamiento); err != nil {
			return nil, err
		}
		alojamientos = append(alojamientos, alojamiento)
	}
	return alojamientos, nil
}

func (r *alojamientoRepository) CreateAlojamiento(alojamiento domain.Alojamiento) error {
	alojamiento.ID = bson.NewObjectID()
	alojamiento.DateRegister = time.Now()
	_, err := r.AlojamientoCollection.InsertOne(context.Background(), alojamiento)
	return err
}

func (r *alojamientoRepository) DeleteAlojamiento(id string) error {
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de alojamiento inválido")
	}
	_, err = r.AlojamientoCollection.DeleteOne(context.Background(), bson.M{"_id": objID})
	return err
}

func (r *alojamientoRepository) UpdateAlojamiento(updateData map[string]interface{}) (domain.Alojamiento, error) {
	idStr, ok := updateData["_id"].(string)
	if !ok {
		return domain.Alojamiento{}, errors.New("ID de alojamiento no proporcionado o inválido")
	}
	objID, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return domain.Alojamiento{}, errors.New("ID de alojamiento inválido")
	}
	delete(updateData, "_id")

	update := bson.M{"$set": updateData}
	_, err = r.AlojamientoCollection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		return domain.Alojamiento{}, err
	}

	var updatedAlojamiento domain.Alojamiento
	err = r.AlojamientoCollection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&updatedAlojamiento)
	if err != nil {
		return domain.Alojamiento{}, err
	}
	return updatedAlojamiento, nil
}
