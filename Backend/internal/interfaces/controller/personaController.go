package controller

import (
	"github.com/Pabluntt/RutaSocial/Backend/internal/usecase"
	"github.com/gin-gonic/gin"
)

type personaController struct {
	personaUseCase usecase.PersonaUseCase
}

func NewPersonaController(personaUseCase usecase.PersonaUseCase) *personaController {
	return &personaController{personaUseCase: personaUseCase}
}

func (ctrl *personaController) GetAll(c *gin.Context) {
	ctrl.personaUseCase.GetAll(c)
}

func (ctrl *personaController) GetByID(c *gin.Context) {
	ctrl.personaUseCase.GetByID(c)
}

func (ctrl *personaController) Search(c *gin.Context) {
	ctrl.personaUseCase.Search(c)
}

func (ctrl *personaController) Create(c *gin.Context) {
	ctrl.personaUseCase.Create(c)
}

func (ctrl *personaController) Update(c *gin.Context) {
	ctrl.personaUseCase.Update(c)
}

func (ctrl *personaController) Delete(c *gin.Context) {
	ctrl.personaUseCase.Delete(c)
}

func (ctrl *personaController) AddAntecedente(c *gin.Context) {
	ctrl.personaUseCase.AddAntecedente(c)
}

func (ctrl *personaController) DeleteAntecedente(c *gin.Context) {
	ctrl.personaUseCase.DeleteAntecedente(c)
}

func (ctrl *personaController) AddInfoMedica(c *gin.Context) {
	ctrl.personaUseCase.AddInfoMedica(c)
}

func (ctrl *personaController) DeleteInfoMedica(c *gin.Context) {
	ctrl.personaUseCase.DeleteInfoMedica(c)
}
