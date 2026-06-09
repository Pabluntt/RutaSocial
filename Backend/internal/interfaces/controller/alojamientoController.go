package controller

import (
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

type alojamientoController struct {
	alojamientoUseCase usecase.AlojamientoUseCase
}

func NewAlojamientoController(alojamientoUseCase usecase.AlojamientoUseCase) *alojamientoController {
	return &alojamientoController{
		alojamientoUseCase: alojamientoUseCase,
	}
}

func (a *alojamientoController) GetAllAlojamientos(c *gin.Context) {
	a.alojamientoUseCase.GetAllAlojamientos(c)
}

func (a *alojamientoController) CreateAlojamiento(c *gin.Context) {
	a.alojamientoUseCase.CreateAlojamiento(c)
}

func (a *alojamientoController) DeleteAlojamiento(c *gin.Context) {
	a.alojamientoUseCase.DeleteAlojamiento(c)
}

func (a *alojamientoController) UpdateAlojamiento(c *gin.Context) {
	a.alojamientoUseCase.UpdateAlojamiento(c)
}
