package controller

import (
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

type weatherController struct {
	weatherUseCase usecase.WeatherUseCase
}

func NewWeatherController(weatherUseCase usecase.WeatherUseCase) *weatherController {
	return &weatherController{
		weatherUseCase: weatherUseCase,
	}
}

func (w *weatherController) GetWeather(c *gin.Context) {
	w.weatherUseCase.GetWeather(c)
}
