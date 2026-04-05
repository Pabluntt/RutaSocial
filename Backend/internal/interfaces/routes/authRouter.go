// Package routes contiene rutas HTTP y los controladores asociados para manejar las solicitudes de autenticación.
// Se definen las rutas y se asocian con el controlador de correspondiente.
// De ser necesario, se usa validacion por rol.
package routes

import (
	"github.com/SebaVCH/hdcProject/internal/infrastructure/database"
	"github.com/SebaVCH/hdcProject/internal/interfaces/controller"
	"github.com/SebaVCH/hdcProject/internal/interfaces/middleware"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// SetupAuthRouter configura las rutas de autenticación en el router de Gin.
// Crea el repositorio de autenticación, el caso de uso y el controlador, y define las rutas para registro e inicio de sesión.
func SetupAuthRouter(r *gin.Engine) {
	authRepo := repository.NewAuthRepository(database.Client.Database("pip").Collection("usuarios"))
	authUseCase := usecase.NewAuthUseCase(authRepo)
	authController := controller.NewAuthController(authUseCase)

	r.POST("/register", authController.Register)
	r.POST("/login", authController.Login)
	protected := r.Group("/")
	protected.Use(middleware.AuthMiddleware())
}
