// Package usecase implementa la logica de negocios y validaciones.
// Se encarga de interactuar con los repositorios y responde al llamado de los controladores.
package usecase

import (
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

// AuthUseCase define la interfaz para las operaciones de autenticación.
// Contiene métodos para iniciar sesión y registrar usuarios.
type AuthUseCase interface {
	Login(c *gin.Context)
	Register(c *gin.Context)
}

// authUseCase implementa la interfaz AuthUseCase.
// Contiene un repositorio de autenticación para interactuar con la base de datos.
type authUseCase struct {
	authRepository repository.AuthRepository
}

// NewAuthUseCase crea una nueva instancia de authUseCase.
// Recibe un repositorio de autenticación y retorna una instancia de AuthUseCase.
func NewAuthUseCase(authRepository repository.AuthRepository) AuthUseCase {
	return &authUseCase{
		authRepository: authRepository,
	}
}

// Login maneja la solicitud de inicio de sesión.
// Valida los datos de entrada, verifica las credenciales del usuario y retorna un token JWT si son válidas.
func (a authUseCase) Login(c *gin.Context) {
	var body struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al procesar los datos de inicio de sesión"})
		return
	}

	if !utils.IsValidEmail(body.Email) || !utils.IsValidString(body.Password) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El correo electrónico o la contraseña no son válidos"})
		return
	}

	token, err := a.authRepository.Login(body.Email, body.Password)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Credenciales inválidas"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"token": token})
}

// Register maneja la solicitud de registro de un nuevo usuario.
// Valida los datos de entrada y registra al usuario en la base de datos. Retorna un token JWT si el registro es exitoso.
func (a authUseCase) Register(c *gin.Context) {
	var user domain.Usuario

	if err := c.ShouldBindJSON(&user); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al procesar los datos del usuario"})
		return
	}

	if !utils.IsValidEmail(user.Email) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El correo electrónico no es válido"})
		return
	}

	if !utils.IsValidString(user.Name) || !utils.IsValidString(user.Password) || !utils.IsValidPhone(user.Phone) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Los datos entregados solo pueden presentar caracteres alfanuméricos, espacios, guiones, guiones bajos, puntos y comas"})
		return
	}

	if len(user.Password) < 8 {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "La contraseña debe tener al menos 8 caracteres"})
		return
	}

	token, err := a.authRepository.Register(user)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Ocurrió un registrar el usuario"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"token": token})
}
