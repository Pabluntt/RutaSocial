package routes

import (
	"github.com/SebaVCH/hdcProject/internal/infrastructure/database"
	"github.com/SebaVCH/hdcProject/internal/interfaces/controller"
	"github.com/SebaVCH/hdcProject/internal/interfaces/middleware"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

func SetupPersonaRouter(r *gin.Engine) {
	personaRepo := repository.NewPersonaRepository(
		database.Client.Database("pip").Collection("personas"),
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
	protected.DELETE("/:id", personaController.Delete)
	protected.POST("/:id/antecedentes", personaController.AddAntecedente)
	protected.DELETE("/:id/antecedentes/:entryId", personaController.DeleteAntecedente)
	protected.POST("/:id/info-medica", personaController.AddInfoMedica)
	protected.DELETE("/:id/info-medica/:entryId", personaController.DeleteInfoMedica)
}
