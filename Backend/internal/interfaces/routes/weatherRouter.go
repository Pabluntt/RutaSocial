package routes

import (
	"time"

	"github.com/Pabluntt/RutaSocial/Backend/internal/interfaces/controller"
	"github.com/Pabluntt/RutaSocial/Backend/internal/interfaces/middleware"
	"github.com/Pabluntt/RutaSocial/Backend/internal/usecase"
	"github.com/gin-gonic/gin"
)

func SetupWeatherRouter(r *gin.Engine) {
	weatherUseCase := usecase.NewWeatherUseCase()
	weatherController := controller.NewWeatherController(weatherUseCase)

	r.GET("/weather", middleware.RateLimitMiddleware(60, time.Minute), weatherController.GetWeather)
}
