package usecase

import (
	"errors"
	"net/http"
	"time"

	"github.com/Pabluntt/RutaSocial/Backend/internal/domain"
	"github.com/Pabluntt/RutaSocial/Backend/internal/repository"
	"github.com/Pabluntt/RutaSocial/Backend/internal/utils"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type calendarEventRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	DateStart   string `json:"date_start"`
	TimeStart   string `json:"time_start"`
	TimeEnd     string `json:"time_end"`
	RouteID     string `json:"route_id"`
}

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
	routeRepository    repository.RouteRepository
	userRepository     repository.UserRepository
}

// NewCalendarEventUseCase crea una nueva instancia de calendarEventUseCase.
// Recibe un repositorio de eventos de calendario y retorna una instancia de CalendarEventUseCase.
func NewCalendarEventUseCase(calendarRepository repository.CalendarEventRepository, routeRepository repository.RouteRepository, userRepository repository.UserRepository) CalendarEventUseCase {
	return &calendarEventUseCase{
		calendarRepository: calendarRepository,
		routeRepository:    routeRepository,
		userRepository:     userRepository,
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
	if utils.HasPagination(c) {
		paginated, meta := utils.PaginateSlice(c, events)
		c.IndentedJSON(http.StatusOK, gin.H{"message": paginated, "pagination": meta})
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
	if !requireSelfOrAdmin(c, userID) {
		return
	}

	events, err := ce.calendarRepository.GetCalendarEventsByUserID(c.Request.Context(), userID)
	if err != nil {
		logUseCaseError(c, "calendar_event.get_by_user", http.StatusBadRequest, err, "target_user_id", userID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener eventos del usuario"})
		return
	}
	if utils.HasPagination(c) {
		paginated, meta := utils.PaginateSlice(c, events)
		c.IndentedJSON(http.StatusOK, gin.H{"message": paginated, "pagination": meta})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": events})
}

// CreateCalendarEvent maneja la solicitud para crear un nuevo evento de calendario.
// Valida los datos de entrada y verifica que el título y la descripción no contengan caracteres inválidos.
func (ce calendarEventUseCase) CreateCalendarEvent(c *gin.Context) {
	var req calendarEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logUseCaseWarn(c, "calendar_event.create.bind_json", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	dateStart, err := time.Parse(time.RFC3339, req.DateStart)
	if err != nil {
		logUseCaseWarn(c, "calendar_event.create.date_start", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Fecha de inicio inválida"})
		return
	}

	event := domain.EventoCalendario{
		Title:       req.Title,
		Description: req.Description,
		DateStart:   dateStart,
		TimeStart:   req.TimeStart,
		TimeEnd:     req.TimeEnd,
	}
	if req.RouteID != "" && req.RouteID != "000000000000000000000000" {
		routeID, err := bson.ObjectIDFromHex(req.RouteID)
		if err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de ruta inválido"})
			return
		}
		event.RouteID = routeID
	}

	if !utils.IsValidString(event.Title) || (event.Description != "" && !utils.IsValidString(event.Description)) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El título o la descripción contienen caracteres inválidos"})
		return
	}

	userID, ok := getAuthenticatedUserID(c)
	if !ok {
		return
	}

	var createdRouteID string
	if event.RouteID.IsZero() {
		userObjID, err := bson.ObjectIDFromHex(userID)
		if err != nil {
			c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			return
		}

		route := domain.Route{
			Title:       event.Title,
			Description: event.Description,
			RouteLeader: userObjID,
			Team:        []bson.ObjectID{userObjID},
		}
		if u, err := ce.userRepository.GetUserByID(c.Request.Context(), userID); err == nil {
			route.InstitutionID = u.InstitutionID
		} else {
			logUseCaseWarn(c, "calendar_event.create_route.get_user", http.StatusInternalServerError, err, "user_id", userID)
		}
		if err := ce.routeRepository.CreateScheduledRoute(c.Request.Context(), &route); err != nil {
			if errors.Is(err, repository.ErrRouteTitleAlreadyExists) {
				c.IndentedJSON(http.StatusConflict, gin.H{"error": "El nombre de la ruta ya está ocupado"})
				return
			}
			logUseCaseError(c, "calendar_event.create_route", http.StatusBadRequest, err)
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear la ruta del evento"})
			return
		}
		event.RouteID = route.ID
		createdRouteID = route.ID.Hex()
	}

	createdEvent, err := ce.calendarRepository.CreateCalendarEvent(c.Request.Context(), event, userID)
	if err != nil {
		if createdRouteID != "" {
			_ = ce.routeRepository.DeleteRoute(c.Request.Context(), createdRouteID)
		}
		logUseCaseError(c, "calendar_event.create", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear el evento: "})
		return
	}
	c.IndentedJSON(http.StatusOK, createdEvent)
}

// DeleteCalendarEvent maneja la solicitud para eliminar un evento de calendario.
// Verifica que el usuario tenga permisos para eliminar el evento y que el ID del evento sea válido.
// Si el evento tiene una ruta asociada, la marca como "Eliminada".
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

	if userRole != domain.RoleAdmin {
		if err := ce.calendarRepository.FindByIDAndUserID(c.Request.Context(), eventID, userID); err != nil {
			logUseCaseWarn(c, "calendar_event.delete.authorize", http.StatusBadRequest, err, "event_id", eventID)
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}

	event, findErr := ce.calendarRepository.FindByID(c.Request.Context(), eventID)
	if findErr != nil {
		logUseCaseError(c, "calendar_event.delete.find", http.StatusBadRequest, findErr, "event_id", eventID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener el evento"})
		return
	}

	err := ce.calendarRepository.DeleteCalendarEvent(c.Request.Context(), eventID)
	if err != nil {
		logUseCaseError(c, "calendar_event.delete", http.StatusBadRequest, err, "event_id", eventID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al eliminar el evento"})
		return
	}

	if !event.RouteID.IsZero() {
		if softErr := ce.routeRepository.SoftDeleteRoute(c.Request.Context(), event.RouteID.Hex()); softErr != nil {
			logUseCaseWarn(c, "calendar_event.delete.soft_delete_route", http.StatusBadRequest, softErr, "route_id", event.RouteID.Hex())
		}
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

	if userRole != domain.RoleAdmin {
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
		} else {
			routeObjID, err := bson.ObjectIDFromHex(routeID)
			if err != nil {
				c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de ruta inválido"})
				return
			}
			updateData["route_id"] = routeObjID
		}
	}
	if dateStart, ok := updateData["date_start"].(string); ok {
		parsedDateStart, err := time.Parse(time.RFC3339, dateStart)
		if err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Fecha de inicio inválida"})
			return
		}
		updateData["date_start"] = parsedDateStart
	}

	updateEvent, err := ce.calendarRepository.UpdateCalendarEvent(c.Request.Context(), updateData)
	if err != nil {
		logUseCaseError(c, "calendar_event.update", http.StatusBadRequest, err, "event_id", eventID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar el evento"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": updateEvent})
}
