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

// SetupRiskRouter configura las rutas para la gestión de riesgos.
// Crea el repositorio de riesgos, el caso de uso y el controlador, y define las rutas para crear, obtener, actualizar y eliminar riesgos.
func SetupRiskRouter(r *gin.Engine) {
	riskRepo := repository.NewRiskRepository(database.Client.Database(config.DBName).Collection("risks"))
	riskUseCase := usecase.NewRiskUseCase(riskRepo)
	riskController := controller.NewRiskController(riskUseCase)

	protected := r.Group("/risk")
	protected.Use(middleware.AuthMiddleware())
	protected.POST("", riskController.CreateRisk)
	protected.GET("", riskController.GetAllRisks)
	protected.PUT("/:id", riskController.UpdateRisk)
	protected.DELETE("/:id", riskController.DeleteRisk)
}
