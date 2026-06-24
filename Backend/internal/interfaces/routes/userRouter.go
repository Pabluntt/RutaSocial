package routes

import (
	"github.com/SebaVCH/hdcProject/internal/config"
	"github.com/SebaVCH/hdcProject/internal/infrastructure/database"
	"github.com/SebaVCH/hdcProject/internal/interfaces/controller"
	"github.com/SebaVCH/hdcProject/internal/interfaces/middleware"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// SetupUserRouter configura las rutas para la gestión de usuarios.
// Crea el repositorio de usuarios, el caso de uso y el controlador, y define las rutas para obtener el perfil del usuario, su nombre por ID, todos los usuarios y actualizar la información del usuario.
func SetupUserRouter(r *gin.Engine) {
	userRepo := repository.NewUserRepository(database.Client.Database(config.DBName).Collection("usuarios"))
	userUseCase := usecase.NewUserUseCase(userRepo)
	userController := controller.NewUserController(userUseCase)

	protected := r.Group("/user")
	protected.Use(middleware.AuthMiddleware())
	protected.GET("/profile", userController.GetUserProfile)
	protected.GET("/public-info/:id", userController.GetPublicInfoByID)
	protected.PUT("/update", userController.UpdateUserInfo)
	protected.GET("/", middleware.RoleMiddleware("admin"), userController.GetAllUsers)
	protected.GET("", middleware.RoleMiddleware("admin"), userController.GetAllUsers)
	protected.POST("/", middleware.RoleMiddleware("admin"), userController.CreateUserByAdmin)
	protected.POST("", middleware.RoleMiddleware("admin"), userController.CreateUserByAdmin)
	protected.GET("/:id", middleware.RoleMiddleware("admin"), userController.GetUserByID)
	protected.PUT("/:id", middleware.RoleMiddleware("admin"), userController.UpdateUserByAdmin)
	protected.DELETE("/:id", middleware.RoleMiddleware("admin"), userController.DeleteUser)
}
