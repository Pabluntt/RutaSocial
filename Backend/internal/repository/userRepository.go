package repository

import (
	"context"
	"errors"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// UserRepository define la interfaz para las operaciones relacionadas con usuarios.
// Contiene métodos para obtener, actualizar y eliminar usuarios, así como obtener información pública.
type UserRepository interface {
	GetUserByID(id string) (domain.Usuario, error)
	GetUserProfile(userID string) (domain.Usuario, error)
	UpdateUserInfo(userID bson.ObjectID, userData map[string]interface{}) (domain.Usuario, error)
	GetAllUsers() ([]domain.Usuario, error)
	GetPublicInfoByID(id string) (map[string]string, error)
}

// userRepository implementa la interfaz UserRepository.
// Contiene una colección de usuarios para interactuar con la base de datos.
type userRepository struct {
	UserCollection *mongo.Collection
}

// NewUserRepository crea una nueva instancia de userRepository.
// Recibe una colección de usuarios y retorna una instancia de UserRepository.
func NewUserRepository(userCollection *mongo.Collection) UserRepository {
	return &userRepository{UserCollection: userCollection}
}

// GetAllUsers obtiene todos los usuarios de la base de datos.
// Retorna un slice de usuarios o un error si ocurre algún problema.
func (u *userRepository) GetAllUsers() ([]domain.Usuario, error) {
	cursor, err := u.UserCollection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var users []domain.Usuario
	if err := cursor.All(context.Background(), &users); err != nil {
		return nil, err
	}
	return users, nil
}

// GetPublicInfoByID obtiene información pública de un usuario por su ID.
// Recibe el ID como string, lo convierte a ObjectID y busca en la colección.
func (u *userRepository) GetPublicInfoByID(id string) (map[string]string, error) {
	var user domain.Usuario
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return map[string]string{"name": ""}, err
	}

	err = u.UserCollection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		return map[string]string{"name": ""}, err
	}
	return map[string]string{"name": user.Name, "institutionID": user.InstitutionID.String(), "phone": user.Phone}, nil
}

// GetUserByID obtiene un usuario por su ID.
// Recibe el ID como string, lo convierte a ObjectID y busca en la colección.
func (u *userRepository) GetUserByID(id string) (domain.Usuario, error) {
	var user domain.Usuario
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return domain.Usuario{}, err
	}

	err = u.UserCollection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		return domain.Usuario{}, err
	}
	return user, nil
}

// GetUserProfile obtiene el perfil de un usuario por su ID.
// Utiliza el método GetUserByID para obtener la información del usuario.
func (u *userRepository) GetUserProfile(userID string) (domain.Usuario, error) {
	return u.GetUserByID(userID)
}

// UpdateUserInfo actualiza la información de un usuario.
// Recibe el ID del usuario y un mapa con los datos a actualizar.
func (u *userRepository) UpdateUserInfo(userID bson.ObjectID, userData map[string]interface{}) (domain.Usuario, error) {
	var currentUser domain.Usuario
	err := u.UserCollection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&currentUser)
	if err != nil {
		return domain.Usuario{}, errors.New("usuario no encontrado")
	}

	filteredData := make(map[string]interface{})

	if name, ok := userData["name"].(string); ok && name != "" {
		filteredData["name"] = name
	}

	if phone, ok := userData["phone"].(string); ok && phone != "" {
		filteredData["phone"] = phone
	}

	newPassword, newPassOk := userData["newPassword"].(string)
	if newPassOk && newPassword != "" {
		currentPassword, currentPassOk := userData["currentPassword"].(string)
		if !currentPassOk || currentPassword == "" {
			return domain.Usuario{}, errors.New("se requiere la contraseña actual para establecer una nueva")
		}

		if !utils.CheckPasswordHash(currentPassword, currentUser.Password) {
			return domain.Usuario{}, errors.New("la contraseña actual es incorrecta")
		}

		confirmNewPassword, confirmPassOk := userData["confirmNewPassword"].(string)
		if !confirmPassOk || confirmNewPassword == "" {
			return domain.Usuario{}, errors.New("se requiere la confirmación de la nueva contraseña")
		}

		if newPassword != confirmNewPassword {
			return domain.Usuario{}, errors.New("la nueva contraseña y su confirmación no coinciden")
		}

		hashedPassword, err := utils.HashPassword(newPassword)
		if err != nil {
			return domain.Usuario{}, errors.New("error al hashear la nueva contraseña")
		}
		filteredData["password"] = hashedPassword
	}

	if len(filteredData) == 0 {
		return domain.Usuario{}, errors.New("no se proporcionaron campos válidos para actualizar")
	}

	filter := bson.M{"_id": userID}
	update := bson.M{"$set": filteredData}

	_, err = u.UserCollection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return domain.Usuario{}, err
	}

	var updatedUser domain.Usuario
	err = u.UserCollection.FindOne(context.Background(), filter).Decode(&updatedUser)
	if err != nil {
		return domain.Usuario{}, err
	}

	return updatedUser, nil
}
