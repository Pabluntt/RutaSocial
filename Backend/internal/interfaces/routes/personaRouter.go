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

func SetupPersonaRouter(r *gin.Engine) {
	personaRepo := repository.NewPersonaRepository(
		database.Client.Database(config.DBName).Collection("personas"),
	)
	personaUseCase := usecase.NewPersonaUseCase(personaRepo)
	personaController := controller.NewPersonaController(personaUseCase)

	protected := r.Group("/personas")
	protected.Use(middleware.AuthMiddleware())
	protected.GET("", personaController.GetAll)
	protected.GET("/search", personaController.Search)
	protected.GET("/:id", personaController.GetByID)
	protected.POST("", personaController.Create)
	protected.PUT("/:id", personaController.Update)
	protected.DELETE("/:id", middleware.RoleMiddleware(domain.RoleAdmin), personaController.Delete)
	protected.POST("/:id/antecedentes", personaController.AddAntecedente)
	protected.DELETE("/:id/antecedentes/:entryId", middleware.RoleMiddleware(domain.RoleAdmin), personaController.DeleteAntecedente)
	protected.POST("/:id/info-medica", personaController.AddInfoMedica)
	protected.DELETE("/:id/info-medica/:entryId", middleware.RoleMiddleware(domain.RoleAdmin), personaController.DeleteInfoMedica)
}
