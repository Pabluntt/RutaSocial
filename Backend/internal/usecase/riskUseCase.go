package usecase

import (
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

// RiskUseCase define la interfaz para las operaciones relacionadas con riesgos.
// Contiene métodos para obtener, crear, eliminar y actualizar riesgos.
type RiskUseCase interface {
	GetAllRisks(c *gin.Context)
	CreateRisk(c *gin.Context)
	DeleteRisk(c *gin.Context)
	UpdateRisk(c *gin.Context)
}

// riskUseCase implementa la interfaz RiskUseCase.
// Contiene un repositorio de riesgos para interactuar con la base de datos.
type riskUseCase struct {
	riskRepository repository.RiskRepository
}

// NewRiskUseCase crea una nueva instancia de riskUseCase.
// Recibe un repositorio de riesgos y retorna una instancia de RiskUseCase.
func NewRiskUseCase(riskRepository repository.RiskRepository) RiskUseCase {
	return &riskUseCase{
		riskRepository: riskRepository,
	}
}

// GetAllRisks maneja la solicitud para obtener todos los riesgos.
func (r riskUseCase) GetAllRisks(c *gin.Context) {
	risks, err := r.riskRepository.GetRisks()
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener riesgos"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": risks})
}

// CreateRisk maneja la solicitud para crear un nuevo riesgo.
// Valida los datos de entrada y verifica que la descripción no contenga caracteres inválidos.
func (r riskUseCase) CreateRisk(c *gin.Context) {
	var risk domain.Riesgo
	if err := c.ShouldBindJSON(&risk); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.IsValidString(risk.Description) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Descripción con caracteres inválidos"})
		return
	}

	err := r.riskRepository.CreateRisk(risk)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear el riesgo"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": risk})
}

// DeleteRisk maneja la solicitud para eliminar un riesgo por su ID.
// Si el ID no se proporciona, retorna un error 400 Bad Request.
func (r riskUseCase) DeleteRisk(c *gin.Context) {
	id := c.Param("id")
	err := r.riskRepository.DeleteRisk(id)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al eliminar el riesgo"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": "Riesgo eliminado correctamente"})
}

// UpdateRisk maneja la solicitud para actualizar un riesgo existente.
// Verifica que el ID del riesgo sea válido y que los datos de actualización no contengan caracteres inválidos.
func (r riskUseCase) UpdateRisk(c *gin.Context) {
	riskID := c.Param("id")
	if riskID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de riesgo no proporcionado"})
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

	updateData["_id"] = riskID
	updatedRisk, err := r.riskRepository.UpdateRisk(updateData)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar el riesgo"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": updatedRisk})

}
