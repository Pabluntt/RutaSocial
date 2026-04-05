package utils

import (
	"context"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"log"
	"os"
)

func CreateDefaultAdmin(userCollection *mongo.Collection) error {
	adminEmail := os.Getenv("ADMIN_EMAIL")
	var admin domain.Usuario
	err := userCollection.FindOne(context.Background(), bson.M{"email": adminEmail}).Decode(&admin)
	if err == nil {
		log.Printf("Admin por defecto ya existe con el email: %s", adminEmail)
		return nil
	}

	passwordHashed, err2 := HashPassword(os.Getenv("ADMIN_PASSWORD"))
	if err2 != nil {
		log.Printf("Error al hashear la contraseña del admin por defecto: %v", err)
		return err2
	}
	admin = domain.Usuario{
		Name:          "Admin",
		Phone:         "+56900000000",
		Email:         adminEmail,
		Password:      passwordHashed,
		Role:          "admin",
		InstitutionID: bson.NilObjectID,
	}

	_, err = userCollection.InsertOne(context.Background(), admin)
	if err != nil {
		log.Printf("Error al crear el admin por defecto: %v", err)
		return err
	}

	return nil
}
