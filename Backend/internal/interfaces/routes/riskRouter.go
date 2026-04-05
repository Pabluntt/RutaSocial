package routes

import (
	"github.com/SebaVCH/hdcProject/internal/infrastructure/database"
	"github.com/SebaVCH/hdcProject/internal/interfaces/controller"
	"github.com/SebaVCH/hdcProject/internal/interfaces/middleware"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// SetupRiskRouter configura las rutas para la gestión de riesgos.
// Crea el repositorio de riesgos, el caso de uso y el controlador, y define las rutas para crear, obtener, actualizar y eliminar riesgos.
func SetupRiskRouter(r *gin.Engine) {
	riskRepo := repository.NewRiskRepository(database.Client.Database("pip").Collection("risks"))
	riskUseCase := usecase.NewRiskUseCase(riskRepo)
	riskController := controller.NewRiskController(riskUseCase)

	protected := r.Group("/risk")
	protected.Use(middleware.AuthMiddleware())
	protected.POST("", riskController.CreateRisk)
	protected.GET("", riskController.GetAllRisks)
	protected.PUT("/:id", riskController.UpdateRisk)
	protected.DELETE("/:id", riskController.DeleteRisk)
}
