package routes

import (
	"github.com/Pabluntt/RutaSocial/Backend/internal/config"
	"github.com/Pabluntt/RutaSocial/Backend/internal/domain"
	"github.com/Pabluntt/RutaSocial/Backend/internal/infrastructure/database"
	"github.com/Pabluntt/RutaSocial/Backend/internal/interfaces/controller"
	"github.com/Pabluntt/RutaSocial/Backend/internal/interfaces/middleware"
	"github.com/Pabluntt/RutaSocial/Backend/internal/repository"
	"github.com/Pabluntt/RutaSocial/Backend/internal/usecase"
	"github.com/gin-gonic/gin"
)

// SetupInstitutionRouter configura las rutas para las instituciones.
// Crea el repositorio de instituciones, el caso de uso y el controlador, y define las rutas para obtener, crear, actualizar y eliminar instituciones.
// Las rutas están protegidas por middleware de autenticación y autorización, permitiendo solo a los usuarios con rol de "admin" acceder a ellas.
func SetupInstitutionRouter(r *gin.Engine) {
	db := database.Client.Database(config.DBName)
	institutionRepo := repository.NewInstitutionRepository(db.Collection("institutions"), db.Collection("usuarios"))
	institutionUseCase := usecase.NewInstitutionUseCase(institutionRepo)
	institutionController := controller.NewInstitutionController(institutionUseCase)

	protected := r.Group("/institution")
	protected.Use(middleware.AuthMiddleware())
	protected.GET("/", institutionController.GetAllInstitutions)
	protected.GET("/:id", institutionController.GetInstitutionByID)
	protected.POST("/", middleware.RoleMiddleware(domain.RoleAdmin), institutionController.CreateInstitution)
	protected.PUT("/:id", middleware.RoleMiddleware(domain.RoleAdmin), institutionController.UpdateInstitution)
	protected.DELETE("/:id", middleware.RoleMiddleware(domain.RoleAdmin), institutionController.DeleteInstitution)
}
