// Package repository contiene la logica de acceso y manejo de la base de datos.
// Responde a las solicitudes de los casos de uso y realiza operaciones CRUD sobre los datos.
package repository

import (
	"context"
	"errors"
	"github.com/Pabluntt/RutaSocial/Backend/internal/domain"
	"github.com/Pabluntt/RutaSocial/Backend/internal/utils"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// AuthRepository define la interfaz para las operaciones de autenticación.
// Contiene métodos para iniciar sesión y registrar usuarios.
type AuthRepository interface {
	Login(ctx context.Context, email, password string) (string, error)
	Register(ctx context.Context, user domain.Usuario) (string, error)
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
func (a *authRepository) Login(ctx context.Context, email, password string) (string, error) {
	var user domain.Usuario
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	err := a.UserCollection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		if err != mongo.ErrNoDocuments {
			logRepositoryError(ctx, "auth", "login.find_user", err, "collection", "usuarios")
		}
		return "", errors.New("error al iniciar sesión")
	}

	if !utils.CheckPasswordHash(password, user.Password) {
		return "", errors.New("error al iniciar sesión")
	}
	if !user.Active() {
		return "", errors.New("cuenta pendiente de aprobación")
	}

	token, err := utils.GenerateToken(user.ID.Hex(), user.Role)
	if err != nil {
		logRepositoryError(ctx, "auth", "login.generate_token", err, "user_id", user.ID.Hex(), "role", user.Role)
		return "", err
	}

	return token, nil
}

// Register maneja la solicitud de registro de un nuevo usuario.
// Verifica si el usuario ya existe, hashea la contraseña, inserta al usuario en la base de datos y envía un correo de registro con dicha contraseña.
func (a *authRepository) Register(ctx context.Context, user domain.Usuario) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	existing := a.UserCollection.FindOne(ctx, bson.M{"email": user.Email})
	if existing.Err() == nil {
		return "", errors.New("el usuario ya existe")
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		logRepositoryError(ctx, "auth", "register.hash_password", err, "role", user.Role, "institution_id", user.InstitutionID.Hex())
		return "", err
	}

	user.Password = hashedPassword
	user.CompletedRoutes = 0
	user.ListRoutes = []domain.Route{}
	user.DateRegister = time.Now()
	user.IsActive = domain.BoolPtr(false)

	_, err = a.UserCollection.Database().Collection("usuarios").InsertOne(ctx, user)
	if err != nil {
		logRepositoryError(ctx, "auth", "register.insert_user", err, "collection", "usuarios", "role", user.Role, "institution_id", user.InstitutionID.Hex())
		return "", err
	}

	return "", nil
}
