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

// SetupPeopleHelpedRouter configura las rutas para las personas ayudadas.
// Esta función quedó "obsoleta" dado que las personas ayudadas ahora se manejan a través de los puntos de ayuda.
func SetupPeopleHelpedRouter(r *gin.Engine) {
	peopleHelpedRepo := repository.NewPeopleHelpedRepository(
		database.Client.Database(config.DBName).Collection("helping_points"),
		database.Client.Database(config.DBName).Collection("people_helped"),
	)
	peopleHelpedUseCase := usecase.NewPeopleHelpedUseCase(peopleHelpedRepo)
	peopleHelpedController := controller.NewPeopleHelpedController(peopleHelpedUseCase)

	protected := r.Group("/people-helped")
	protected.Use(middleware.AuthMiddleware())
	protected.POST("", peopleHelpedController.CreatePersonHelped)
	protected.GET("", peopleHelpedController.GetAllPeopleHelped)
	protected.PUT("/:id", peopleHelpedController.UpdatePersonHelped)
	protected.DELETE("/:id", peopleHelpedController.DeletePersonHelped)
}
