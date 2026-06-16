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

func SetupAlojamientoRouter(r *gin.Engine) {
	alojamientoRepo := repository.NewAlojamientoRepository(database.Client.Database(config.DBName).Collection("alojamientos"))
	alojamientoUseCase := usecase.NewAlojamientoUseCase(alojamientoRepo)
	alojamientoController := controller.NewAlojamientoController(alojamientoUseCase)

	protected := r.Group("/alojamiento")
	protected.Use(middleware.AuthMiddleware())
	protected.POST("", alojamientoController.CreateAlojamiento)
	protected.GET("", alojamientoController.GetAllAlojamientos)
	protected.PUT("/:id", alojamientoController.UpdateAlojamiento)
	protected.DELETE("/:id", alojamientoController.DeleteAlojamiento)
}
