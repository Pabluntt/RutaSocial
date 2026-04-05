package usecase

import (
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
)

// UserUseCase define la interfaz para las operaciones relacionadas con usuarios.
// Contiene métodos para obtener un usuario por ID, obtener el perfil del usuario, actualizar la información del usuario,
type UserUseCase interface {
	GetUserByID(c *gin.Context)
	GetUserProfile(c *gin.Context)
	UpdateUserInfo(c *gin.Context)
	GetAllUsers(c *gin.Context)
	GetPublicInfoByID(c *gin.Context)
}

// UserUseCase implementa la interfaz UserUseCase.
// Contiene un repositorio de usuarios para interactuar con la base de datos.
type userUseCase struct {
	userRepository repository.UserRepository
}

// NewUserUseCase crea una nueva instancia de userUseCase.
// Recibe un repositorio de usuarios y retorna una instancia de UserUseCase.
func NewUserUseCase(repo repository.UserRepository) UserUseCase {
	return &userUseCase{
		userRepository: repo,
	}
}

// GetUserByID maneja la solicitud para obtener un usuario por su ID.
// Retorna un JSON con el usuario encontrado o un error si no se encuentra.
func (u userUseCase) GetUserByID(c *gin.Context) {
	id := c.Param("id")
	user, err := u.userRepository.GetUserByID(id)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Usuario no encontrado"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": user})
}

// GetPublicInfoByID maneja la solicitud para obtener información pública de un usuario por su ID.
func (u userUseCase) GetPublicInfoByID(c *gin.Context) {
	id := c.Param("id")
	result, err := u.userRepository.GetPublicInfoByID(id)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Usuario no encontrado"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": result})
}

// GetUserProfile maneja la solicitud para obtener el perfil del usuario autenticado.
// Valida el token JWT y retorna un JSON con la información del usuario o un error si no está autenticado.
func (u userUseCase) GetUserProfile(c *gin.Context) {
	user, done := u.ValidateUser(c)
	if done {
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": user})
}

// UpdateUserInfo maneja la solicitud para actualizar la información del usuario autenticado.
// Valida el token JWT, verifica los datos de entrada y actualiza la información del usuario en la base de datos.
func (u userUseCase) UpdateUserInfo(c *gin.Context) {
	user, done := u.ValidateUser(c)
	if done {
		return
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	for key, value := range updateData {
		strVal, ok := value.(string)
		if ok {
			switch key {
			case "phone":
				if !utils.IsValidPhone(strVal) {
					c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Teléfono inválido"})
					return
				}
			default:
				if !utils.IsValidString(strVal) {
					c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Hay caracteres inválidos"})
					return
				}
			}
			updateData[key] = strVal
		}
	}

	updatedUser, err := u.userRepository.UpdateUserInfo(user.ID, updateData)

	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar usuario"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": updatedUser})
}

// GetAllUsers maneja la solicitud para obtener todos los usuarios.
// Retorna un JSON con la lista de usuarios o un error si ocurre algún problema al obtenerlos.
func (u userUseCase) GetAllUsers(c *gin.Context) {
	users, err := u.userRepository.GetAllUsers()
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener usuarios"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": users})
}

// ValidateUser valida el token JWT del usuario autenticado y retorna la información del usuario.
// Si el token no es válido o el usuario no está autenticado, retorna un error.
func (u userUseCase) ValidateUser(c *gin.Context) (domain.Usuario, bool) {
	claims, exists := c.Get("user")
	if !exists {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return domain.Usuario{}, true
	}

	mapClaims, ok := claims.(jwt.MapClaims)
	if !ok {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error en formato de token"})
		return domain.Usuario{}, true
	}

	userID, exists := mapClaims["user_id"]
	if !exists {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "ID de usuario no encontrado en token"})
		return domain.Usuario{}, true
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de usuario en formato inválido"})
		return domain.Usuario{}, true
	}

	user, err := u.userRepository.GetUserByID(userIDStr)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Usuario no encontrado"})
		return domain.Usuario{}, true
	}
	return user, false
}
