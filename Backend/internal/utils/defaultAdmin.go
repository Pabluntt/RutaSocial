package utils

import (
	"context"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"log/slog"
	"os"
	"time"
)

func CreateDefaultAdmin(userCollection *mongo.Collection) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	adminEmail := os.Getenv("ADMIN_EMAIL")
	var admin domain.Usuario
	err := userCollection.FindOne(ctx, bson.M{"email": adminEmail}).Decode(&admin)
	if err == nil {
		slog.Info("Admin por defecto ya existe", "email", adminEmail)
		return nil
	}

	passwordHashed, err2 := HashPassword(os.Getenv("ADMIN_PASSWORD"))
	if err2 != nil {
		slog.Error("Error al hashear contraseña del admin por defecto", "error", err2)
		return err2
	}
	admin = domain.Usuario{
		Name:          "Admin",
		Phone:         "+56900000000",
		Email:         adminEmail,
		Password:      passwordHashed,
		Role:          domain.RoleAdmin,
		InstitutionID: bson.NilObjectID,
	}

	_, err = userCollection.InsertOne(ctx, admin)
	if err != nil {
		slog.Error("Error al crear el admin por defecto", "error", err)
		return err
	}

	return nil
}
