package usecase

import (
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

// InstitutionUseCase define la interfaz para las operaciones relacionadas con instituciones.
// Contiene métodos para obtener, crear, actualizar y eliminar instituciones.
type InstitutionUseCase interface {
	GetAllInstitutions(c *gin.Context)
	GetInstitutionByID(c *gin.Context)
	CreateInstitution(c *gin.Context)
	UpdateInstitution(c *gin.Context)
	DeleteInstitution(c *gin.Context)
}

// institutionUseCase implementa la interfaz InstitutionUseCase.
// Contiene un repositorio de instituciones para interactuar con la base de datos.
type institutionUseCase struct {
	institutionRepository repository.InstitutionRepository
}

// NewInstitutionUseCase crea una nueva instancia de institutionUseCase.
// Recibe un repositorio de instituciones y retorna una instancia de InstitutionUseCase.
func NewInstitutionUseCase(institutionRepository repository.InstitutionRepository) InstitutionUseCase {
	return &institutionUseCase{
		institutionRepository: institutionRepository,
	}
}

// GetAllInstitutions maneja la solicitud para obtener todas las instituciones.
func (i institutionUseCase) GetAllInstitutions(c *gin.Context) {
	institutions, err := i.institutionRepository.GetAllInstitutions()
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener las instituciones"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": institutions})
}

// GetInstitutionByID maneja la solicitud para obtener una institución por su ID.
func (i institutionUseCase) GetInstitutionByID(c *gin.Context) {
	idSTR := c.Param("id")

	if idSTR == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de institución no proporcionado"})
		return
	}

	institution, err := i.institutionRepository.GetInstitutionByID(idSTR)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener la institución"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": institution})
}

// CreateInstitution maneja la solicitud para crear una nueva institución.
func (i institutionUseCase) CreateInstitution(c *gin.Context) {
	var institution domain.Institution
	if err := c.ShouldBindJSON(&institution); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.IsValidString(institution.Name) || !utils.IsValidColor(institution.Color) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El nombre o el color presentan caracteres no permitidos"})
		return
	}

	err := i.institutionRepository.CreateInstitution(institution)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear la institución"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": "Institución creada con éxito."})
}

// UpdateInstitution maneja la solicitud para actualizar una institución existente.
func (i institutionUseCase) UpdateInstitution(c *gin.Context) {
	idSTR := c.Param("id")
	if idSTR == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de institución no proporcionado"})
		return
	}

	_, err := i.institutionRepository.GetInstitutionByID(idSTR)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Institución no encontrada"})
		return
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	name, nameOk := updateData["name"].(string)
	color, colorOk := updateData["color"].(string)

	if nameOk && !utils.IsValidString(name) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El nombre presenta caracteres no permitidos"})
		return
	}
	if colorOk && !utils.IsValidColor(color) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El color presenta caracteres no permitidos"})
		return
	}

	err = i.institutionRepository.UpdateInstitution(idSTR, updateData)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar la institución"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Institución actualizada correctamente"})
}

// DeleteInstitution maneja la solicitud para eliminar una institución por su ID.
func (i institutionUseCase) DeleteInstitution(c *gin.Context) {
	idSTR := c.Param("id")

	if idSTR == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de institución no proporcionado"})
		return
	}

	_, err := i.institutionRepository.GetInstitutionByID(idSTR)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Institución no encontrada"})
		return
	}

	err = i.institutionRepository.DeleteInstitution(idSTR)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al eliminar la institución"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Institución eliminada correctamente"})
}
