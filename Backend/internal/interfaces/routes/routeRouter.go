package routes

import (
	"github.com/SebaVCH/hdcProject/internal/infrastructure/database"
	"github.com/SebaVCH/hdcProject/internal/interfaces/controller"
	"github.com/SebaVCH/hdcProject/internal/interfaces/middleware"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// SetupRouteRouter configura las rutas para la gestión de rutas sociales.
// Crea el repositorio de rutas, el caso de uso y el controlador, y define las rutas para crear, obtener, actualizar y eliminar rutas.
// También define rutas para unirse a una ruta, finalizar una ruta y obtener la participación del usuario en una ruta.
func SetupRouteRouter(r *gin.Engine) {
	routeRepo := repository.NewRouteRepository(database.Client.Database("pip").Collection("route"), database.Client.Database("pip").Collection("helping_points"))
	routeUseCase := usecase.NewRouteUseCase(routeRepo)
	routeController := controller.NewRouteController(routeUseCase)

	protected := r.Group("/route")
	protected.Use(middleware.AuthMiddleware())
	protected.GET("", routeController.FindAll)
	protected.GET("/:id", routeController.FindByID)
	protected.POST("", routeController.CreateRoute)
	protected.PUT("/:id", middleware.RoleMiddleware("admin"), routeController.UpdateRoute)
	protected.DELETE("/:id", middleware.RoleMiddleware("admin"), routeController.DeleteRoute)
	protected.PATCH("/:id", routeController.FinishRoute)
	protected.POST("/join/:code", routeController.JoinRoute)
	protected.GET("/participation/:id", routeController.GetMyParticipation)
}
