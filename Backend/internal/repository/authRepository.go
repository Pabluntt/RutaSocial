// Package repository contiene la logica de acceso y manejo de la base de datos.
// Responde a las solicitudes de los casos de uso y realiza operaciones CRUD sobre los datos.
package repository

import (
	"context"
	"errors"
	"fmt"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// AuthRepository define la interfaz para las operaciones de autenticación.
// Contiene métodos para iniciar sesión y registrar usuarios.
type AuthRepository interface {
	Login(email, password string) (string, error)
	Register(user domain.Usuario) (string, error)
}

// authRepository implementa la interfaz AuthRepository.
// Contiene una colección de usuarios para interactuar con la base de datos.
type authRepository struct {
	UserCollection *mongo.Collection
}

// NewAuthRepository crea una nueva instancia de authRepository.
// Recibe una colección de usuarios y retorna una instancia de AuthRepository.
func NewAuthRepository(userCollection *mongo.Collection) AuthRepository {
	return &authRepository{UserCollection: userCollection}
}

// Login maneja la solicitud de inicio de sesión.
// Busca al usuario por su correo electrónico, verifica la contraseña y genera un token JWT si las credenciales son válidas.
func (a *authRepository) Login(email, password string) (string, error) {
	var user domain.Usuario
	err := a.UserCollection.FindOne(context.TODO(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		return "", errors.New("error al iniciar sesión")
	}

	if !utils.CheckPasswordHash(password, user.Password) {
		return "", errors.New("error al iniciar sesión")
	}

	token, err := utils.GenerateToken(user.ID.Hex(), user.Role)
	if err != nil {
		return "", err
	}

	return token, nil
}

// Register maneja la solicitud de registro de un nuevo usuario.
// Verifica si el usuario ya existe, hashea la contraseña, inserta al usuario en la base de datos y envía un correo de registro con dicha contraseña.
func (a *authRepository) Register(user domain.Usuario) (string, error) {

	existing := a.UserCollection.FindOne(context.TODO(), bson.M{"email": user.Email})
	if existing.Err() == nil {
		return "", errors.New("el usuario ya existe")
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return "", err
	}

	unhashedPassword := user.Password
	user.Password = hashedPassword
	user.CompletedRoutes = 0
	user.ListRoutes = []domain.Route{}
	user.DateRegister = time.Now()

	res, err := a.UserCollection.Database().Collection("usuarios").InsertOne(context.TODO(), user)
	if err != nil {
		return "", err
	}

	usuarioID := res.InsertedID.(bson.ObjectID)

	token, err := utils.GenerateToken(usuarioID.Hex(), user.Role)
	if err != nil {
		return "", err
	}

	err = utils.SendRegistrationMail(user, unhashedPassword)
	if err != nil {
		fmt.Println("Error enviando correo:", err)
	}

	return token, nil
}
