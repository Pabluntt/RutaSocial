package usecase

import (
	"net/http"
	"strings"

	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
)

// HelpingPointUseCase define la interfaz para las operaciones relacionadas con puntos de ayuda.
// Contiene métodos para obtener, crear, actualizar y eliminar puntos de ayuda.
type HelpingPointUseCase interface {
	GetAllPoints(c *gin.Context)
	CreateHelpingPoint(c *gin.Context)
	UpdateHelpingPoint(c *gin.Context)
	DeleteHelpingPoint(c *gin.Context)
	LinkPersonaToHelpPoint(c *gin.Context)
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
	helpPoints, err := h.helpingPointRepository.GetAllPoints(c.Request.Context())
	if err != nil {
		logUseCaseError(c, "help_point.get_all", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener puntos de ayuda"})
		return
	}
	if utils.HasPagination(c) {
		paginated, meta := utils.PaginateSlice(c, helpPoints)
		c.IndentedJSON(http.StatusOK, gin.H{"message": paginated, "pagination": meta})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": helpPoints})
}

// CreateHelpingPoint maneja la solicitud para crear un nuevo punto de ayuda.
// Valida los datos de entrada y verifica que el género y el nombre de la persona ayudada no contengan caracteres inválidos.
func (h helpingPointUseCase) CreateHelpingPoint(c *gin.Context) {
	var helpPoint domain.PuntoAyuda

	userID, ok := getAuthenticatedUserID(c)
	if !ok {
		return
	}

	if err := c.ShouldBindJSON(&helpPoint); err != nil {
		logUseCaseWarn(c, "help_point.create.bind_json", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if len(helpPoint.People) == 0 && (helpPoint.PeopleHelped.Name != "" || helpPoint.PeopleHelped.Gender != "" || helpPoint.PeopleHelped.Rut != "" || helpPoint.PeopleHelped.Age != 0) {
		helpPoint.People = append(helpPoint.People, helpPoint.PeopleHelped)
	}

	for _, person := range helpPoint.People {
		if person.Name == "" {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El nombre de cada persona es obligatorio"})
			return
		}
		if !utils.IsValidString(person.Name) || (person.Gender != "" && !utils.IsValidString(person.Gender)) {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Se presentaron caracteres inválidos en el nombre o género de una persona"})
			return
		}
		if person.Rut != "" && !utils.IsValidRut(person.Rut) {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El formato del RUT no es válido"})
			return
		}
	}

	helpPoint.Comment = strings.TrimSpace(helpPoint.Comment)
	if !utils.IsValidComment(helpPoint.Comment) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Se presentaron caracteres inválidos en el comentario del punto"})
		return
	}

	createdHelpPoint, err := h.helpingPointRepository.CreateHelpingPoint(c.Request.Context(), helpPoint, userID)
	if err != nil {
		logUseCaseError(c, "help_point.create", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear punto de ayuda"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": createdHelpPoint})
}

// UpdateHelpingPoint maneja la solicitud para actualizar un punto de ayuda existente.
// Verifica que el ID del punto de ayuda y el ID del usuario sean válidos antes de proceder con la actualización.
func (h helpingPointUseCase) UpdateHelpingPoint(c *gin.Context) {
	helpingPointID := c.Param("id")
	if helpingPointID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de punto no proporcionado"})
		return
	}

	userID, ok := getAuthenticatedUserID(c)
	if !ok {
		return
	}

	if err := h.helpingPointRepository.FindByIDAndUserID(c.Request.Context(), helpingPointID, userID); err != nil {
		logUseCaseWarn(c, "help_point.update.authorize", http.StatusBadRequest, err, "help_point_id", helpingPointID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		logUseCaseWarn(c, "help_point.update.bind_json", http.StatusBadRequest, err, "help_point_id", helpingPointID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.SanitizeStringFields(c, updateData) {
		return
	}

	updateData["_id"] = helpingPointID
	updatedHelpingPoint, err := h.helpingPointRepository.UpdateHelpingPoint(c.Request.Context(), updateData)
	if err != nil {
		logUseCaseError(c, "help_point.update", http.StatusBadRequest, err, "help_point_id", helpingPointID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar el punto de ayuda"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": updatedHelpingPoint})
}

// LinkPersonaToHelpPoint maneja la solicitud para vincular una persona existente a un punto de ayuda.
func (h helpingPointUseCase) LinkPersonaToHelpPoint(c *gin.Context) {
	helpPointID := c.Param("helpPointId")
	personaID := c.Param("personaId")
	if helpPointID == "" || personaID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "IDs no proporcionados"})
		return
	}

	userID, ok := getAuthenticatedUserID(c)
	if !ok {
		return
	}

	if err := h.helpingPointRepository.FindByIDAndUserID(c.Request.Context(), helpPointID, userID); err != nil {
		logUseCaseWarn(c, "help_point.link_persona.authorize", http.StatusBadRequest, err, "help_point_id", helpPointID, "persona_id", personaID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.helpingPointRepository.LinkPersonaToHelpPoint(c.Request.Context(), helpPointID, personaID)
	if err != nil {
		logUseCaseError(c, "help_point.link_persona", http.StatusBadRequest, err, "help_point_id", helpPointID, "persona_id", personaID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al vincular persona"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Persona vinculada correctamente"})
}

// DeleteHelpingPoint maneja la solicitud para eliminar un punto de ayuda.
// Verifica que el ID del punto de ayuda sea válido y que el usuario tenga permisos para eliminarlo.
func (h helpingPointUseCase) DeleteHelpingPoint(c *gin.Context) {
	helpingPointID := c.Param("id")
	if helpingPointID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de punto de ayuda no proporcionado"})
		return
	}

	userID, ok := getAuthenticatedUserID(c)
	if !ok {
		return
	}

	if err := h.helpingPointRepository.FindByIDAndUserID(c.Request.Context(), helpingPointID, userID); err != nil {
		logUseCaseWarn(c, "help_point.delete.authorize", http.StatusNotFound, err, "help_point_id", helpingPointID)
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	err := h.helpingPointRepository.DeleteHelpingPoint(c.Request.Context(), helpingPointID)
	if err != nil {
		logUseCaseError(c, "help_point.delete", http.StatusBadRequest, err, "help_point_id", helpingPointID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al eliminar punto de ayuda"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Punto de ayuda eliminado correctamente"})
}
