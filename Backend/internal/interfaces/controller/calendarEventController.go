package controller

import (
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// calendarEventController es la estructura que implementa los controladores de eventos del calendario.
// Contiene una instancia del caso de uso de eventos del calendario para manejar las solicitudes de creación, obtención, actualización y eliminación de eventos.
type calendarEventController struct {
	calendarEventUseCase usecase.CalendarEventUseCase
}

// NewCalendarEventController crea una nueva instancia de calendarEventController.
// Recibe un caso de uso de eventos del calendario y devuelve un puntero a calendarEventController.
func NewCalendarEventController(calendarEventUseCase usecase.CalendarEventUseCase) *calendarEventController {
	return &calendarEventController{
		calendarEventUseCase: calendarEventUseCase,
	}
}

// CreateCalendarEvent maneja la solicitud para crear un nuevo evento de calendario.
// @Summary Crear nuevo evento de calendario
// @Description Crea un nuevo evento de calendario en el sistema. Requiere autenticación.
// @Tags Eventos de Calendario
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param event body domain.CalendarEventRequest true "Datos del nuevo evento"
// @Success 200 {object} domain.EventoCalendario "Evento creado exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Datos inválidos"
// @Failure 400 {object} domain.ErrorResponse "El título o la descripción contienen caracteres inválidos"
// @Failure 400 {object} domain.ErrorResponse "Error al crear el evento"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /calendar-event [post]
func (ce *calendarEventController) CreateCalendarEvent(c *gin.Context) {
	ce.calendarEventUseCase.CreateCalendarEvent(c)
}

// GetAllCalendarEvents maneja la solicitud para obtener todos los eventos de calendario.
// @Summary Obtener todos los eventos de calendario
// @Description Obtiene una lista de todos los eventos de calendario registrados en el sistema. Requiere autenticación.
// @Tags Eventos de Calendario
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} domain.EventoCalendario "Lista de eventos obtenida exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Error al obtener eventos"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /calendar-event [get]
func (ce *calendarEventController) GetAllCalendarEvents(c *gin.Context) {
	ce.calendarEventUseCase.GetAllCalendarEvents(c)
}

// DeleteCalendarEvent maneja la solicitud para eliminar un evento de calendario.
// @Summary Eliminar evento de calendario
// @Description Elimina un evento de calendario del sistema. Los usuarios pueden eliminar solo sus propios eventos, los administradores pueden eliminar cualquier evento. Requiere autenticación.
// @Tags Eventos de Calendario
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID del evento"
// @Success 200 {object} domain.SuccessResponse "Evento eliminado correctamente"
// @Failure 400 {object} domain.ErrorResponse "ID de evento no proporcionado"
// @Failure 400 {object} domain.ErrorResponse "Error al eliminar el evento"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /calendar-event/{id} [delete]
func (ce *calendarEventController) DeleteCalendarEvent(c *gin.Context) {
	ce.calendarEventUseCase.DeleteCalendarEvent(c)
}

// UpdateCalendarEvent maneja la solicitud para actualizar un evento de calendario.
// @Summary Actualizar evento de calendario
// @Description Actualiza los datos de un evento de calendario existente. Los usuarios pueden actualizar solo sus propios eventos, los administradores pueden actualizar cualquier evento. Requiere autenticación.
// @Tags Eventos de Calendario
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID del evento"
// @Param event body object true "Datos actualizados del evento"
// @Success 200 {object} domain.SuccessResponse "Evento actualizado correctamente"
// @Failure 400 {object} domain.ErrorResponse "ID de evento no proporcionado"
// @Failure 400 {object} domain.ErrorResponse "Datos inválidos"
// @Failure 400 {object} domain.ErrorResponse "Error al actualizar el evento"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /calendar-event/{id} [put]
func (ce *calendarEventController) UpdateCalendarEvent(c *gin.Context) {
	ce.calendarEventUseCase.UpdateCalendarEvent(c)
}
