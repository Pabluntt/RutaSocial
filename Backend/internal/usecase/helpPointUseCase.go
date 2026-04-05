package usecase

import (
	"net/http"

	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// HelpingPointUseCase define la interfaz para las operaciones relacionadas con puntos de ayuda.
// Contiene métodos para obtener, crear, actualizar y eliminar puntos de ayuda.
type HelpingPointUseCase interface {
	GetAllPoints(c *gin.Context)
	CreateHelpingPoint(c *gin.Context)
	UpdateHelpingPoint(c *gin.Context)
	DeleteHelpingPoint(c *gin.Context)
}

// helpingPointUseCase implementa la interfaz HelpingPointUseCase.
// Contiene un repositorio de puntos de ayuda para interactuar con la base de datos.
type helpingPointUseCase struct {
	helpingPointRepository repository.HelpPointRepository
}

// NewHelpingPointUseCase crea una nueva instancia de helpingPointUseCase.
// Recibe un repositorio de puntos de ayuda y retorna una instancia de HelpingPointUseCase.
func NewHelpingPointUseCase(helpingPointRepository repository.HelpPointRepository) HelpingPointUseCase {
	return &helpingPointUseCase{
		helpingPointRepository: helpingPointRepository,
	}
}

// GetAllPoints maneja la solicitud para obtener todos los puntos de ayuda.
func (h helpingPointUseCase) GetAllPoints(c *gin.Context) {
	helpPoints, err := h.helpingPointRepository.GetAllPoints()
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener puntos de ayuda"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": helpPoints})
}

// CreateHelpingPoint maneja la solicitud para crear un nuevo punto de ayuda.
// Valida los datos de entrada y verifica que el género y el nombre de la persona ayudada no contengan caracteres inválidos.
func (h helpingPointUseCase) CreateHelpingPoint(c *gin.Context) {
	var helpPoint domain.PuntoAyuda

	claims, _ := c.Get("user")
	userClaims := claims.(jwt.MapClaims)
	userID := userClaims["user_id"].(string)

	if err := c.ShouldBindJSON(&helpPoint); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.IsValidString(helpPoint.PeopleHelped.Gender) || !utils.IsValidString(helpPoint.PeopleHelped.Name) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Se presentaron caracteres inválidos en el género o nombre de la persona ayudada"})
		return
	}

	err := h.helpingPointRepository.CreateHelpingPoint(helpPoint, userID)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear punto de ayuda"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": helpPoint})
}

// UpdateHelpingPoint maneja la solicitud para actualizar un punto de ayuda existente.
// Verifica que el ID del punto de ayuda y el ID del usuario sean válidos antes de proceder con la actualización.
func (h helpingPointUseCase) UpdateHelpingPoint(c *gin.Context) {
	helpingPointID := c.Param("id")
	if helpingPointID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de punto no proporcionado"})
		return
	}

	claims, _ := c.Get("user")
	userClaims := claims.(jwt.MapClaims)
	userID := userClaims["user_id"].(string)

	if err := h.helpingPointRepository.FindByIDAndUserID(helpingPointID, userID); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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

	updateData["_id"] = helpingPointID
	updatedHelpingPoint, err := h.helpingPointRepository.UpdateHelpingPoint(updateData)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar el punto de ayuda"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": updatedHelpingPoint})
}

// DeleteHelpingPoint maneja la solicitud para eliminar un punto de ayuda.
// Verifica que el ID del punto de ayuda sea válido y que el usuario tenga permisos para eliminarlo.
func (h helpingPointUseCase) DeleteHelpingPoint(c *gin.Context) {
	helpingPointID := c.Param("id")
	if helpingPointID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de punto de ayuda no proporcionado"})
		return
	}

	claims, _ := c.Get("user")
	userClaims := claims.(jwt.MapClaims)
	userID := userClaims["user_id"].(string)

	if err := h.helpingPointRepository.FindByIDAndUserID(helpingPointID, userID); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}

	err := h.helpingPointRepository.DeleteHelpingPoint(helpingPointID)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al eliminar punto de ayuda"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Punto de ayuda eliminado correctamente"})
}
