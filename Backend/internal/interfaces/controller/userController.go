package controller

import (
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// userController es la estructura que implementa los controladores de usuarios.
// Contiene una instancia del caso de uso de usuarios para manejar las solicitudes de obtención, actualización y perfil de usuario.
type userController struct {
	userUseCase usecase.UserUseCase
}

// NewUserController crea una nueva instancia de userController.
// Recibe un caso de uso de usuarios y devuelve un puntero a userController.
func NewUserController(userUseCase usecase.UserUseCase) *userController {
	return &userController{
		userUseCase: userUseCase,
	}
}

// GetAllUsers maneja la solicitud para obtener todos los usuarios.
// @Summary Obtener todos los usuarios
// @Description Obtiene una lista de todos los usuarios registrados en el sistema. Requiere autenticación y rol de administrador.
// @Tags Usuarios
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} domain.Usuario "Lista de usuarios obtenida exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Error al obtener usuarios"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Failure 401 {object} domain.ErrorResponse "Rol no encontrado"
// @Failure 400 {object} domain.ErrorResponse "Acceso denegado"
// @Router /user [get]
func (u *userController) GetAllUsers(c *gin.Context) {
	u.userUseCase.GetAllUsers(c)
}

// UpdateUserInfo maneja la solicitud para actualizar la información del usuario autenticado.
// @Summary Actualizar información del usuario
// @Description Actualiza los datos del usuario autenticado. Requiere autenticación.
// @Tags Usuarios
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param user body object true "Datos a actualizar del usuario"
// @Success 200 {object} domain.Usuario "Usuario actualizado exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Datos inválidos"
// @Failure 400 {object} domain.ErrorResponse "Teléfono inválido"
// @Failure 400 {object} domain.ErrorResponse "Hay caracteres inválidos"
// @Failure 400 {object} domain.ErrorResponse "Error al actualizar usuario"
// @Failure 401 {object} domain.ErrorResponse "Usuario no autenticado"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Failure 401 {object} domain.ErrorResponse "ID de usuario no encontrado en token"
// @Failure 400 {object} domain.ErrorResponse "Error en formato de token"
// @Failure 400 {object} domain.ErrorResponse "ID de usuario en formato inválido"
// @Failure 400 {object} domain.ErrorResponse "Usuario no encontrado"
// @Router /user/update [put]
func (u *userController) UpdateUserInfo(c *gin.Context) {
	u.userUseCase.UpdateUserInfo(c)
}

// GetUserProfile maneja la solicitud para obtener el perfil del usuario autenticado.
// @Summary Obtener perfil del usuario
// @Description Obtiene la información del perfil del usuario autenticado. Requiere autenticación.
// @Tags Usuarios
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} domain.Usuario "Perfil de usuario obtenido exitosamente"
// @Failure 401 {object} domain.ErrorResponse "Usuario no autenticado"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Failure 401 {object} domain.ErrorResponse "ID de usuario no encontrado en token"
// @Failure 400 {object} domain.ErrorResponse "Error en formato de token"
// @Failure 400 {object} domain.ErrorResponse "ID de usuario en formato inválido"
// @Failure 400 {object} domain.ErrorResponse "Usuario no encontrado"
// @Router /user/profile [get]
func (u *userController) GetUserProfile(c *gin.Context) {
	u.userUseCase.GetUserProfile(c)
}

// GetUserByID maneja la solicitud para obtener un usuario por su ID.
// @Summary Obtener usuario por ID
// @Description Obtiene la información de un usuario específico mediante su ID. Requiere autenticación y rol de administrador.
// @Tags Usuarios
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID del usuario"
// @Success 200 {object} domain.Usuario "Usuario obtenido exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Usuario no encontrado"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Failure 401 {object} domain.ErrorResponse "Rol no encontrado"
// @Failure 400 {object} domain.ErrorResponse "Acceso denegado"
// @Router /user/{id} [get]
func (u *userController) GetUserByID(c *gin.Context) {
	u.userUseCase.GetUserByID(c)
}

// GetPublicInfoByID maneja la solicitud para obtener información pública de un usuario por su ID.
// @Summary Obtener información pública del usuario
// @Description Obtiene la información pública de un usuario específico mediante su ID. Requiere autenticación.
// @Tags Usuarios
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID del usuario"
// @Success 200 {object} object "Información pública del usuario obtenida exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Usuario no encontrado"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /user/public-info/{id} [get]
func (u *userController) GetPublicInfoByID(c *gin.Context) {
	u.userUseCase.GetPublicInfoByID(c)
}
