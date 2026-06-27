package repository

import (
	"context"
	"errors"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"time"
)

// UserRepository define la interfaz para las operaciones relacionadas con usuarios.
// Contiene métodos para obtener, actualizar y eliminar usuarios, así como obtener información pública.
type UserRepository interface {
GetUserByID(ctx context.Context, id string) (domain.Usuario, error)
GetUserProfile(ctx context.Context, userID string) (domain.Usuario, error)
UpdateUserInfo(ctx context.Context, userID bson.ObjectID, userData map[string]interface{}) (domain.Usuario, error)
GetAllUsers(ctx context.Context) ([]domain.Usuario, error)
GetPublicInfoByID(ctx context.Context, id string) (map[string]string, error)
CreateUserByAdmin(ctx context.Context, user domain.Usuario) (domain.Usuario, error)
UpdateUserByAdmin(ctx context.Context, updateData map[string]interface{}) (domain.Usuario, error)
DeleteUserByID(ctx context.Context, id string) error
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
func (u *userRepository) GetAllUsers(ctx context.Context) ([]domain.Usuario, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	cursor, err := u.UserCollection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []domain.Usuario
	if err := cursor.All(ctx, &users); err != nil {
		return nil, err
	}
	for i := range users {
		users[i].Sanitize()
	}
	return users, nil
}

// GetPublicInfoByID obtiene información pública de un usuario por su ID.
// Recibe el ID como string, lo convierte a ObjectID y busca en la colección.
func (u *userRepository) GetPublicInfoByID(ctx context.Context, id string) (map[string]string, error) {
	var user domain.Usuario
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return map[string]string{"name": ""}, err
	}

	err = u.UserCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		return map[string]string{"name": ""}, err
	}
	return map[string]string{"name": user.Name, "institutionID": user.InstitutionID.Hex(), "phone": user.Phone}, nil
}

// GetUserByID obtiene un usuario por su ID.
// Recibe el ID como string, lo convierte a ObjectID y busca en la colección.
func (u *userRepository) GetUserByID(ctx context.Context, id string) (domain.Usuario, error) {
	var user domain.Usuario
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return domain.Usuario{}, err
	}

	err = u.UserCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		return domain.Usuario{}, err
	}
	user.Sanitize()
	return user, nil
}

// GetUserProfile obtiene el perfil de un usuario por su ID.
// Utiliza el método GetUserByID para obtener la información del usuario.
func (u *userRepository) GetUserProfile(ctx context.Context, userID string) (domain.Usuario, error) {
	return u.GetUserByID(ctx, userID)
}

// UpdateUserInfo actualiza la información de un usuario.
// Recibe el ID del usuario y un mapa con los datos a actualizar.
func (u *userRepository) UpdateUserInfo(ctx context.Context, userID bson.ObjectID, userData map[string]interface{}) (domain.Usuario, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	var currentUser domain.Usuario
	err := u.UserCollection.FindOne(ctx, bson.M{"_id": userID}).Decode(&currentUser)
	if err != nil {
		return domain.Usuario{}, errors.New("usuario no encontrado")
	}

	allowedFields := map[string]bool{
		"name": true, "phone": true,
		"newPassword": true, "currentPassword": true, "confirmNewPassword": true,
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

	// Filtrar solo campos permitidos
	for k := range userData {
		if !allowedFields[k] {
			delete(userData, k)
		}
	}

	if len(filteredData) == 0 {
		return domain.Usuario{}, errors.New("no se proporcionaron campos válidos para actualizar")
	}

	filter := bson.M{"_id": userID}
	update := bson.M{"$set": filteredData}

	_, err = u.UserCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		return domain.Usuario{}, err
	}

	var updatedUser domain.Usuario
	err = u.UserCollection.FindOne(ctx, filter).Decode(&updatedUser)
	if err != nil {
		return domain.Usuario{}, err
	}

	updatedUser.Sanitize()
	return updatedUser, nil
}

// CreateUserByAdmin crea un nuevo usuario desde el panel de administración.
// Verifica si el correo ya existe, hashea la contraseña y guarda el usuario.
func (u *userRepository) CreateUserByAdmin(ctx context.Context, user domain.Usuario) (domain.Usuario, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	existing := u.UserCollection.FindOne(ctx, bson.M{"email": user.Email})
	if existing.Err() == nil {
		return domain.Usuario{}, errors.New("el usuario ya existe")
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return domain.Usuario{}, err
	}

	user.Password = hashedPassword
	user.CompletedRoutes = 0
	user.ListRoutes = []domain.Route{}
	user.DateRegister = time.Now()
	user.IsActive = true

	res, err := u.UserCollection.Database().Collection("usuarios").InsertOne(ctx, user)
	if err != nil {
		return domain.Usuario{}, err
	}

	insertedID, ok := res.InsertedID.(bson.ObjectID)
	if ok {
		user.ID = insertedID
	}

	user.Sanitize()
	return user, nil
}

// UpdateUserByAdmin actualiza un usuario desde el panel de administración.
// Recibe un mapa con los datos a actualizar y el ID del usuario.
func (u *userRepository) UpdateUserByAdmin(ctx context.Context, updateData map[string]interface{}) (domain.Usuario, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	idStr, ok := updateData["_id"].(string)
	if !ok || idStr == "" {
		return domain.Usuario{}, errors.New("ID de usuario no proporcionado")
	}
	delete(updateData, "_id")

	objID, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return domain.Usuario{}, errors.New("ID de usuario inválido")
	}

	var currentUser domain.Usuario
	err = u.UserCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&currentUser)
	if err != nil {
		return domain.Usuario{}, errors.New("usuario no encontrado")
	}

	if email, ok := updateData["email"].(string); ok && email != "" {
		existing := u.UserCollection.FindOne(ctx, bson.M{"email": email, "_id": bson.M{"$ne": objID}})
		if existing.Err() == nil {
			return domain.Usuario{}, errors.New("el correo electrónico ya está en uso")
		}
	}

	allowedFields := map[string]bool{
		"name": true, "phone": true, "email": true, "role": true, "institutionID": true,
	}
	filtered := make(map[string]interface{})
	for k, v := range updateData {
		if allowedFields[k] {
			if strVal, ok := v.(string); ok && strVal != "" {
				filtered[k] = strVal
			}
		}
	}

	if len(filtered) == 0 {
		return domain.Usuario{}, errors.New("no se proporcionaron campos válidos para actualizar")
	}

	_, err = u.UserCollection.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": filtered})
	if err != nil {
		return domain.Usuario{}, err
	}

	var updatedUser domain.Usuario
	err = u.UserCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&updatedUser)
	if err != nil {
		return domain.Usuario{}, err
	}

	updatedUser.Sanitize()
	return updatedUser, nil
}

// DeleteUserByID elimina un usuario por su ID.
// Recibe el ID como string, lo convierte a ObjectID y lo elimina de la base de datos.
func (u *userRepository) DeleteUserByID(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de usuario inválido")
	}

	result, err := u.UserCollection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("usuario no encontrado")
	}

	return nil
}




