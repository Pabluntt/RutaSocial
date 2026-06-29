package database

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func EnsureIndexes(db *mongo.Database) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	indexes := map[string][]mongo.IndexModel{
		"usuarios": {
			{Keys: bson.D{{Key: "email", Value: 1}}, Options: options.Index().SetUnique(true)},
			{Keys: bson.D{{Key: "role", Value: 1}}},
			{Keys: bson.D{{Key: "institutionID", Value: 1}}},
			{Keys: bson.D{{Key: "is_active", Value: 1}}},
		},
		"route": {
			{Keys: bson.D{{Key: "route_leader", Value: 1}}},
			{Keys: bson.D{{Key: "team", Value: 1}}},
			{Keys: bson.D{{Key: "status", Value: 1}}},
			{Keys: bson.D{{Key: "code", Value: 1}}, Options: options.Index().SetUnique(true).SetSparse(true)},
		},
		"helping_points": {
			{Keys: bson.D{{Key: "route_id", Value: 1}}},
			{Keys: bson.D{{Key: "author_id", Value: 1}}},
			{Keys: bson.D{{Key: "persona_ids", Value: 1}}},
			{Keys: bson.D{{Key: "date_register", Value: -1}}},
		},
		"risks": {
			{Keys: bson.D{{Key: "route_id", Value: 1}}},
			{Keys: bson.D{{Key: "author_id", Value: 1}}},
			{Keys: bson.D{{Key: "date_register", Value: -1}}},
		},
		"alertas": {
			{Keys: bson.D{{Key: "author_id", Value: 1}}},
			{Keys: bson.D{{Key: "created_at", Value: -1}}},
			{Keys: bson.D{{Key: "send_to_all", Value: 1}}},
		},
		"notification_person_relation": {
			{Keys: bson.D{{Key: "person_id", Value: 1}, {Key: "read", Value: 1}, {Key: "dismissed", Value: 1}}},
			{Keys: bson.D{{Key: "notification_id", Value: 1}}},
			{Keys: bson.D{{Key: "person_id", Value: 1}, {Key: "notification_id", Value: 1}}, Options: options.Index().SetUnique(true)},
		},
		"calendar_events": {
			{Keys: bson.D{{Key: "author_id", Value: 1}}},
			{Keys: bson.D{{Key: "institution_id", Value: 1}}},
			{Keys: bson.D{{Key: "date_start", Value: 1}}},
			{Keys: bson.D{{Key: "route_id", Value: 1}}},
		},
		"personas": {
			{Keys: bson.D{{Key: "rut", Value: 1}}, Options: options.Index().SetPartialFilterExpression(bson.M{"rut": bson.M{"$exists": true, "$gt": ""}})},
			{Keys: bson.D{{Key: "nombre", Value: 1}}},
			{Keys: bson.D{{Key: "fecha_creacion", Value: -1}}},
		},
		"institutions": {
			{Keys: bson.D{{Key: "name", Value: 1}}},
		},
		"alojamientos": {
			{Keys: bson.D{{Key: "name", Value: 1}}},
		},
	}

	for collection, models := range indexes {
		if len(models) == 0 {
			continue
		}
		if _, err := db.Collection(collection).Indexes().CreateMany(ctx, models); err != nil {
			slog.Warn("No se pudieron crear todos los índices MongoDB", "collection", collection, "error", err)
		}
	}

	slog.Info("Índices MongoDB verificados")
	return nil
}
