package usecase

import (
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/dto"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
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
	CreateUserByAdmin(c *gin.Context)
	UpdateUserByAdmin(c *gin.Context)
	DeleteUser(c *gin.Context)
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
	user, err := u.userRepository.GetUserByID(c.Request.Context(), id)
	if err != nil {
		logUseCaseWarn(c, "user.get_by_id", http.StatusNotFound, err, "target_user_id", id)
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": dto.MapUserToResponse(user)})
}

// GetPublicInfoByID maneja la solicitud para obtener información pública de un usuario por su ID.
func (u userUseCase) GetPublicInfoByID(c *gin.Context) {
	id := c.Param("id")
	result, err := u.userRepository.GetPublicInfoByID(c.Request.Context(), id)
	if err != nil {
		logUseCaseWarn(c, "user.get_public_info", http.StatusBadRequest, err, "target_user_id", id)
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
	c.IndentedJSON(http.StatusOK, gin.H{"message": dto.MapUserToResponse(user)})
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
		logUseCaseWarn(c, "user.update_profile.bind_json", http.StatusBadRequest, err)
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

	updatedUser, err := u.userRepository.UpdateUserInfo(c.Request.Context(), user.ID, updateData)

	if err != nil {
		logUseCaseError(c, "user.update_profile", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar usuario"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": dto.MapUserToResponse(updatedUser)})
}

// GetAllUsers maneja la solicitud para obtener todos los usuarios.
// Retorna un JSON con la lista de usuarios o un error si ocurre algún problema al obtenerlos.
func (u userUseCase) GetAllUsers(c *gin.Context) {
	users, err := u.userRepository.GetAllUsers(c.Request.Context())
	if err != nil {
		logUseCaseError(c, "user.get_all", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener usuarios"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": dto.MapUsersToResponse(users)})
}

// CreateUserByAdmin maneja la solicitud para crear un usuario desde el panel admin.
// Valida los datos requeridos y registra al usuario en la base de datos sin emitir token.
func (u userUseCase) CreateUserByAdmin(c *gin.Context) {
	var req domain.AdminCreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logUseCaseWarn(c, "user.admin_create.bind_json", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al procesar los datos del usuario"})
		return
	}

	if !utils.IsValidEmail(req.Email) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El correo electrónico no es válido"})
		return
	}

	if len(req.Password) < 8 {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "La contraseña debe tener al menos 8 caracteres"})
		return
	}

	if req.Name != "" && !utils.IsValidString(req.Name) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El nombre contiene caracteres inválidos"})
		return
	}

	if req.Phone != "" && !utils.IsValidPhone(req.Phone) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Teléfono inválido"})
		return
	}

	if req.InstitutionID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Debe indicar la institución"})
		return
	}

	institutionID, err := bson.ObjectIDFromHex(req.InstitutionID)
	if err != nil {
		logUseCaseWarn(c, "user.admin_create.invalid_institution", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Institución inválida"})
		return
	}

	// Validar y establecer rol
	role := req.Role
	if role == "" {
		role = domain.RoleVolunteer
	}
	// Solo permitir roles conocidos
	if role != domain.RoleAdmin && role != domain.RoleVolunteer {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El rol debe ser 'admin' o 'voluntario'"})
		return
	}

	newUser := domain.Usuario{
		Name:          req.Name,
		Email:         req.Email,
		Password:      req.Password,
		Phone:         req.Phone,
		Role:          role,
		InstitutionID: institutionID,
	}

	createdUser, err := u.userRepository.CreateUserByAdmin(c.Request.Context(), newUser)
	if err != nil {
		logUseCaseError(c, "user.admin_create", http.StatusBadRequest, err, "institution_id", req.InstitutionID, "role", role)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear usuario"})
		return
	}

	c.IndentedJSON(http.StatusCreated, gin.H{"message": dto.MapUserToResponse(createdUser)})
}

// UpdateUserByAdmin maneja la solicitud para que un administrador actualice un usuario.
// Valida los datos permitidos y actualiza el usuario en la base de datos.
func (u userUseCase) UpdateUserByAdmin(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de usuario no proporcionado"})
		return
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		logUseCaseWarn(c, "user.admin_update.bind_json", http.StatusBadRequest, err, "target_user_id", id)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if name, ok := updateData["name"].(string); ok && name != "" {
		if !utils.IsValidString(name) {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El nombre contiene caracteres inválidos"})
			return
		}
	}

	if phone, ok := updateData["phone"].(string); ok && phone != "" {
		if !utils.IsValidPhone(phone) {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Teléfono inválido"})
			return
		}
	}

	if email, ok := updateData["email"].(string); ok && email != "" {
		if !utils.IsValidEmail(email) {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El correo electrónico no es válido"})
			return
		}
	}

	if role, ok := updateData["role"].(string); ok && role != "" {
		if role != domain.RoleAdmin && role != domain.RoleVolunteer {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El rol debe ser 'admin' o 'voluntario'"})
			return
		}
	}

	updateData["_id"] = id

	updatedUser, err := u.userRepository.UpdateUserByAdmin(c.Request.Context(), updateData)
	if err != nil {
		logUseCaseError(c, "user.admin_update", http.StatusBadRequest, err, "target_user_id", id)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": dto.MapUserToResponse(updatedUser)})
}

// DeleteUser maneja la solicitud para eliminar un usuario por su ID.
// @Summary Eliminar usuario
// @Description Elimina un usuario específico mediante su ID. Requiere autenticación y rol de administrador.
// @Tags Usuarios
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID del usuario a eliminar"
// @Success 200 {object} object "Usuario eliminado exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Usuario no encontrado"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Failure 401 {object} domain.ErrorResponse "Rol no encontrado"
// @Failure 400 {object} domain.ErrorResponse "Acceso denegado"
// @Router /user/{id} [delete]
func (u userUseCase) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	err := u.userRepository.DeleteUserByID(c.Request.Context(), id)
	if err != nil {
		logUseCaseWarn(c, "user.delete", http.StatusBadRequest, err, "target_user_id", id)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": "Usuario eliminado exitosamente"})
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

	user, err := u.userRepository.GetUserByID(c.Request.Context(), userIDStr)
	if err != nil {
		logUseCaseWarn(c, "user.validate.get_by_id", http.StatusBadRequest, err, "target_user_id", userIDStr)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Usuario no encontrado"})
		return domain.Usuario{}, true
	}
	return user, false
}
