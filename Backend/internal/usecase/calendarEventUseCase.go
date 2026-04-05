package usecase

import (
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
)

// CalendarEventUseCase define la interfaz para las operaciones relacionadas con eventos de calendario.
// Contiene métodos para obtener, crear, eliminar y actualizar eventos de calendario.
type CalendarEventUseCase interface {
	GetAllCalendarEvents(c *gin.Context)
	CreateCalendarEvent(c *gin.Context)
	DeleteCalendarEvent(c *gin.Context)
	UpdateCalendarEvent(c *gin.Context)
}

// calendarEventUseCase implementa la interfaz CalendarEventUseCase.
// Contiene un repositorio de eventos de calendario para interactuar con la base de datos.
type calendarEventUseCase struct {
	calendarRepository repository.CalendarEventRepository
}

// NewCalendarEventUseCase crea una nueva instancia de calendarEventUseCase.
// Recibe un repositorio de eventos de calendario y retorna una instancia de CalendarEventUseCase.
func NewCalendarEventUseCase(calendarRepository repository.CalendarEventRepository) CalendarEventUseCase {
	return &calendarEventUseCase{
		calendarRepository: calendarRepository,
	}
}

// GetAllCalendarEvents maneja la solicitud para obtener todos los eventos de calendario.
func (ce calendarEventUseCase) GetAllCalendarEvents(c *gin.Context) {
	events, err := ce.calendarRepository.GetAllCalendarEvents()
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener eventos"})
		return
	}
	c.IndentedJSON(http.StatusOK, events)
}

// CreateCalendarEvent maneja la solicitud para crear un nuevo evento de calendario.
// Valida los datos de entrada y verifica que el título y la descripción no contengan caracteres inválidos.
func (ce calendarEventUseCase) CreateCalendarEvent(c *gin.Context) {
	var event domain.EventoCalendario
	if err := c.ShouldBindJSON(&event); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.IsValidString(event.Title) || !utils.IsValidString(event.Description) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El título o la descripción contienen caracteres inválidos"})
		return
	}

	claims, _ := c.Get("user")
	userClaims := claims.(jwt.MapClaims)
	userID := userClaims["user_id"].(string)

	err := ce.calendarRepository.CreateCalendarEvent(event, userID)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear el evento: "})
		return
	}
	c.IndentedJSON(http.StatusOK, event)
}

// DeleteCalendarEvent maneja la solicitud para eliminar un evento de calendario.
// Verifica que el usuario tenga permisos para eliminar el evento y que el ID del evento sea válido.
func (ce calendarEventUseCase) DeleteCalendarEvent(c *gin.Context) {
	eventID := c.Param("id")

	if eventID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de evento no proporcionado"})
		return
	}

	claims, _ := c.Get("user")
	userClaims := claims.(jwt.MapClaims)
	userID := userClaims["user_id"].(string)
	userRole := userClaims["user_role"].(string)

	if userRole != "admin" {
		if err := ce.calendarRepository.FindByIDAndUserID(eventID, userID); err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err})
			return
		}
	}

	err := ce.calendarRepository.DeleteCalendarEvent(eventID)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al eliminar el evento"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": "Evento eliminado correctamente"})
}

// UpdateCalendarEvent maneja la solicitud para actualizar un evento de calendario.
// Verifica que el usuario tenga permisos para actualizar el evento y que los datos de entrada sean válidos.
func (ce calendarEventUseCase) UpdateCalendarEvent(c *gin.Context) {
	eventID := c.Param("id")
	if eventID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de evento no proporcionado"})
		return
	}

	claims, _ := c.Get("user")
	userClaims := claims.(jwt.MapClaims)
	userID := userClaims["user_id"].(string)
	userRole := userClaims["user_role"].(string)

	if userRole != "admin" {
		if err := ce.calendarRepository.FindByIDAndUserID(eventID, userID); err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err})
			return
		}
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}
	updateData["_id"] = eventID

	if !utils.SanitizeStringFields(c, updateData) {
		return
	}

	updateEvent, err := ce.calendarRepository.UpdateCalendarEvent(updateData)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar el evento"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": updateEvent})
}
