package routes

import (
	"github.com/SebaVCH/hdcProject/internal/interfaces/controller"
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

func SetupWeatherRouter(r *gin.Engine) {
	weatherUseCase := usecase.NewWeatherUseCase()
	weatherController := controller.NewWeatherController(weatherUseCase)

	r.GET("/weather", weatherController.GetWeather)
}
