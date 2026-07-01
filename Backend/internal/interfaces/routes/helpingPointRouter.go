package routes

import (
	"github.com/Pabluntt/RutaSocial/Backend/internal/config"
	"github.com/Pabluntt/RutaSocial/Backend/internal/infrastructure/database"
	"github.com/Pabluntt/RutaSocial/Backend/internal/interfaces/controller"
	"github.com/Pabluntt/RutaSocial/Backend/internal/interfaces/middleware"
	"github.com/Pabluntt/RutaSocial/Backend/internal/repository"
	"github.com/Pabluntt/RutaSocial/Backend/internal/usecase"

	"github.com/gin-gonic/gin"
)

// SetupHelpingPointRouter configura las rutas para los puntos de ayuda.
// Crea el repositorio de puntos de ayuda, el caso de uso y el controlador, y define las rutas para crear, obtener, actualizar y eliminar puntos de ayuda.
func SetupHelpingPointRouter(r *gin.Engine) {
	helpPointRepo := repository.NewHelpPointRepository(
		database.Client.Database(config.DBName).Collection("helping_points"),
		database.Client.Database(config.DBName).Collection("people_helped"),
		database.Client.Database(config.DBName).Collection("personas"),
	)
	helpPointUseCase := usecase.NewHelpingPointUseCase(helpPointRepo)
	helpPointController := controller.NewHelpPointController(helpPointUseCase)

	protected := r.Group("/helping-point")
	protected.Use(middleware.AuthMiddleware())
	protected.POST("", helpPointController.CreateHelpingPoint)
	protected.GET("", helpPointController.GetAllPoints)
	protected.PUT("/:id", helpPointController.UpdateHelpingPoint)
	protected.POST("/:helpPointId/link-persona/:personaId", helpPointController.LinkPersonaToHelpPoint)
	protected.DELETE("/:id", helpPointController.DeleteHelpingPoint)
}
