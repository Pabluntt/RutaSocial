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
	peopleHelped, err := p.peopleHelpedRepository.GetPeopleHelped(c.Request.Context())
	if err != nil {
		logUseCaseError(c, "people_helped.get_all", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener personas ayudadas"})
		return
	}
	if utils.HasPagination(c) {
		paginated, meta := utils.PaginateSlice(c, peopleHelped)
		c.IndentedJSON(http.StatusOK, gin.H{"message": paginated, "pagination": meta})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": peopleHelped})
}

// CreatePersonHelped maneja la solicitud para crear una nueva persona ayudada.
func (p peopleHelpedUseCase) CreatePersonHelped(c *gin.Context) {
	var person domain.PersonaAyudada
	if err := c.ShouldBindJSON(&person); err != nil {
		logUseCaseWarn(c, "people_helped.create.bind_json", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}
	if !utils.IsValidString(person.Name) || (person.Gender != "" && !utils.IsValidString(person.Gender)) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Se presentaron caracteres inválidos"})
		return
	}
	if person.Rut != "" && !utils.IsValidRut(person.Rut) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El formato del RUT no es válido"})
		return
	}
	err := p.peopleHelpedRepository.CreatePersonHelped(c.Request.Context(), person)
	if err != nil {
		logUseCaseError(c, "people_helped.create", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear la persona ayudada"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": person})
}

// DeletePersonHelped maneja la solicitud para eliminar una persona ayudada por su ID.
func (p peopleHelpedUseCase) DeletePersonHelped(c *gin.Context) {
	id := c.Param("id")
	err := p.peopleHelpedRepository.DeletePersonHelped(c.Request.Context(), id)
	if err != nil {
		logUseCaseWarn(c, "people_helped.delete", http.StatusBadRequest, err, "person_id", id)
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
		logUseCaseWarn(c, "people_helped.update.bind_json", http.StatusBadRequest, err, "person_id", personID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.SanitizeStringFields(c, updateData) {
		return
	}

	updateData["_id"] = personID
	updatedPerson, err := p.peopleHelpedRepository.UpdatePersonHelped(c.Request.Context(), updateData)
	if err != nil {
		logUseCaseError(c, "people_helped.update", http.StatusBadRequest, err, "person_id", personID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar la persona ayudada"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": updatedPerson})
}
