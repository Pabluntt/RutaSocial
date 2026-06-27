package usecase

import (
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

// CalendarEventUseCase define la interfaz para las operaciones relacionadas con eventos de calendario.
// Contiene métodos para obtener, crear, eliminar y actualizar eventos de calendario.
type CalendarEventUseCase interface {
	GetAllCalendarEvents(c *gin.Context)
	CreateCalendarEvent(c *gin.Context)
	DeleteCalendarEvent(c *gin.Context)
	UpdateCalendarEvent(c *gin.Context)
	GetUserCalendarEvents(c *gin.Context)
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
	events, err := ce.calendarRepository.GetAllCalendarEvents(c.Request.Context())
	if err != nil {
		logUseCaseError(c, "calendar_event.get_all", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener eventos"})
		return
	}
	c.IndentedJSON(http.StatusOK, events)
}

// GetUserCalendarEvents maneja la solicitud para obtener todos los eventos de calendario de un usuario (admin).
func (ce calendarEventUseCase) GetUserCalendarEvents(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de usuario no proporcionado"})
		return
	}

	events, err := ce.calendarRepository.GetCalendarEventsByUserID(c.Request.Context(), userID)
	if err != nil {
		logUseCaseError(c, "calendar_event.get_by_user", http.StatusBadRequest, err, "target_user_id", userID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener eventos del usuario"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": events})
}

// CreateCalendarEvent maneja la solicitud para crear un nuevo evento de calendario.
// Valida los datos de entrada y verifica que el título y la descripción no contengan caracteres inválidos.
func (ce calendarEventUseCase) CreateCalendarEvent(c *gin.Context) {
	var event domain.EventoCalendario
	if err := c.ShouldBindJSON(&event); err != nil {
		logUseCaseWarn(c, "calendar_event.create.bind_json", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.IsValidString(event.Title) || !utils.IsValidString(event.Description) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El título o la descripción contienen caracteres inválidos"})
		return
	}

	userID, ok := getAuthenticatedUserID(c)
	if !ok {
		return
	}

	createdEvent, err := ce.calendarRepository.CreateCalendarEvent(c.Request.Context(), event, userID)
	if err != nil {
		logUseCaseError(c, "calendar_event.create", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear el evento: "})
		return
	}
	c.IndentedJSON(http.StatusOK, createdEvent)
}

// DeleteCalendarEvent maneja la solicitud para eliminar un evento de calendario.
// Verifica que el usuario tenga permisos para eliminar el evento y que el ID del evento sea válido.
func (ce calendarEventUseCase) DeleteCalendarEvent(c *gin.Context) {
	eventID := c.Param("id")

	if eventID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de evento no proporcionado"})
		return
	}

	userID, userRole, ok := getAuthenticatedUserIDAndRole(c)
	if !ok {
		return
	}

	if userRole != "admin" {
		if err := ce.calendarRepository.FindByIDAndUserID(c.Request.Context(), eventID, userID); err != nil {
			logUseCaseWarn(c, "calendar_event.delete.authorize", http.StatusBadRequest, err, "event_id", eventID)
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}

	err := ce.calendarRepository.DeleteCalendarEvent(c.Request.Context(), eventID)
	if err != nil {
		logUseCaseError(c, "calendar_event.delete", http.StatusBadRequest, err, "event_id", eventID)
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

	userID, userRole, ok := getAuthenticatedUserIDAndRole(c)
	if !ok {
		return
	}

	if userRole != "admin" {
		if err := ce.calendarRepository.FindByIDAndUserID(c.Request.Context(), eventID, userID); err != nil {
			logUseCaseWarn(c, "calendar_event.update.authorize", http.StatusBadRequest, err, "event_id", eventID)
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		logUseCaseWarn(c, "calendar_event.update.bind_json", http.StatusBadRequest, err, "event_id", eventID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}
	updateData["_id"] = eventID

	if !utils.SanitizeStringFields(c, updateData) {
		return
	}

	if routeID, ok := updateData["route_id"].(string); ok {
		if routeID == "" || routeID == "000000000000000000000000" {
			delete(updateData, "route_id")
		}
	}

	updateEvent, err := ce.calendarRepository.UpdateCalendarEvent(c.Request.Context(), updateData)
	if err != nil {
		logUseCaseError(c, "calendar_event.update", http.StatusBadRequest, err, "event_id", eventID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar el evento"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": updateEvent})
}
