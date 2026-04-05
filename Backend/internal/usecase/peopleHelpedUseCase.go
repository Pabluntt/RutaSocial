package usecase

import (
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

// PeopleHelpedUseCase define la interfaz para las operaciones relacionadas con personas ayudadas.
// Contiene métodos para obtener, crear, eliminar y actualizar personas ayudadas.
// Tambien se encuentra "obsoleta" y se recomienda utilizar la nueva implementación de HelpingPointUseCase.
type PeopleHelpedUseCase interface {
	GetAllPeopleHelped(c *gin.Context)
	CreatePersonHelped(c *gin.Context)
	DeletePersonHelped(c *gin.Context)
	UpdatePersonHelped(c *gin.Context)
}

// peopleHelpedUseCase implementa la interfaz PeopleHelpedUseCase.
type peopleHelpedUseCase struct {
	peopleHelpedRepository repository.PeopleHelpedRepository
}

// NewPeopleHelpedUseCase crea una nueva instancia de peopleHelpedUseCase.
// Recibe un repositorio de personas ayudadas y retorna una instancia de PeopleHelpedUseCase.
func NewPeopleHelpedUseCase(peopleHelpedRepository repository.PeopleHelpedRepository) PeopleHelpedUseCase {
	return &peopleHelpedUseCase{
		peopleHelpedRepository: peopleHelpedRepository,
	}
}

// GetAllPeopleHelped maneja la solicitud para obtener todas las personas ayudadas.
func (p peopleHelpedUseCase) GetAllPeopleHelped(c *gin.Context) {
	peopleHelped, err := p.peopleHelpedRepository.GetPeopleHelped()
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener personas ayudadas"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": peopleHelped})
}

// CreatePersonHelped maneja la solicitud para crear una nueva persona ayudada.
func (p peopleHelpedUseCase) CreatePersonHelped(c *gin.Context) {
	var person domain.PersonaAyudada
	if err := c.ShouldBindJSON(&person); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}
	err := p.peopleHelpedRepository.CreatePersonHelped(person)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear la persona ayudada"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": person})
}

// DeletePersonHelped maneja la solicitud para eliminar una persona ayudada por su ID.
func (p peopleHelpedUseCase) DeletePersonHelped(c *gin.Context) {
	id := c.Param("id")
	err := p.peopleHelpedRepository.DeletePersonHelped(id)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al eliminar la persona ayudada"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": "Persona ayudada eliminada correctamente"})
}

// UpdatePersonHelped maneja la solicitud para actualizar una persona ayudada existente.
func (p peopleHelpedUseCase) UpdatePersonHelped(c *gin.Context) {
	personID := c.Param("id")
	if personID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de persona ayudada no proporcionado"})
		return
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.SanitizeStringFields(c, updateData) {
		return
	}

	updateData["_id"] = personID
	updatedPerson, err := p.peopleHelpedRepository.UpdatePersonHelped(updateData)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar la persona ayudada"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": updatedPerson})
}
