package controller

import (
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// peopleHelpedController es la estructura que implementa los controladores de personas ayudadas.
// Al igual que los demás archivos de peopleHelped, este se encuentra "obsoleto" y no se utiliza en el proyecto, dado que se maneja directamente desde helpingPoint.
// Contiene una instancia del caso de uso de personas ayudadas para manejar las solicitudes de creación, obtención, actualización y eliminación de personas ayudadas.
type peopleHelpedController struct {
	peopleHelpedUseCase usecase.PeopleHelpedUseCase
}

// NewPeopleHelpedController crea una nueva instancia de peopleHelpedController.
// Recibe un caso de uso de personas ayudadas y devuelve un puntero a peopleHelpedController.
func NewPeopleHelpedController(peopleHelpedUseCase usecase.PeopleHelpedUseCase) *peopleHelpedController {
	return &peopleHelpedController{
		peopleHelpedUseCase: peopleHelpedUseCase,
	}
}
func (p *peopleHelpedController) GetAllPeopleHelped(c *gin.Context) {
	p.peopleHelpedUseCase.GetAllPeopleHelped(c)
}

func (p *peopleHelpedController) CreatePersonHelped(c *gin.Context) {
	p.peopleHelpedUseCase.CreatePersonHelped(c)
}

func (p *peopleHelpedController) DeletePersonHelped(c *gin.Context) {
	p.peopleHelpedUseCase.DeletePersonHelped(c)
}

func (p *peopleHelpedController) UpdatePersonHelped(c *gin.Context) {
	p.peopleHelpedUseCase.UpdatePersonHelped(c)
}
