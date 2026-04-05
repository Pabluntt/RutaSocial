package controller

import (
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// notificationController es la estructura que implementa los controladores de notificaciones.
// Contiene una instancia del caso de uso de notificaciones para manejar las solicitudes de creación, eliminación, actualización y obtención de notificaciones.
type notificationController struct {
	notificationUseCase usecase.NotificationUseCase
}

// NewNotificationController crea una nueva instancia de notificationController.
// Recibe un caso de uso de notificaciones y devuelve un puntero a notificationController.
func NewNotificationController(notificationUseCase usecase.NotificationUseCase) *notificationController {
	return &notificationController{
		notificationUseCase: notificationUseCase,
	}
}

// CreateNotification maneja la solicitud para crear una nueva notificación.
// @Summary Crear nueva notificación
// @Description Crea una nueva notificación en el sistema. Requiere autenticación.
// @Tags Notificaciones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param notification body domain.Aviso true "Datos de la nueva notificación"
// @Success 200 {object} domain.Aviso "Notificación creada exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Datos inválidos"
// @Failure 400 {object} domain.ErrorResponse "Error al crear la notificación"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /notification [post]
func (n *notificationController) CreateNotification(c *gin.Context) {
	n.notificationUseCase.CreateNotification(c)
}

// DeleteNotification maneja la solicitud para eliminar una notificación por su ID.
// @Summary Eliminar notificación
// @Description Elimina una notificación del sistema mediante su ID. Requiere autenticación y rol de administrador.
// @Tags Notificaciones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID de la notificación"
// @Success 200 {object} domain.SuccessResponse "Notificación eliminada correctamente"
// @Failure 400 {object} domain.ErrorResponse "Error al eliminar la notificación"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Failure 401 {object} domain.ErrorResponse "Rol no encontrado"
// @Failure 400 {object} domain.ErrorResponse "Acceso denegado"
// @Router /notification/{id} [delete]
func (n *notificationController) DeleteNotification(c *gin.Context) {
	n.notificationUseCase.DeleteNotification(c)
}

// UpdateNotification maneja la solicitud para actualizar una notificación existente.
// @Summary Actualizar notificación
// @Description Actualiza los datos de una notificación existente mediante su ID. Requiere autenticación.
// @Tags Notificaciones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID de la notificación"
// @Param notification body object true "Datos actualizados de la notificación"
// @Success 200 {object} domain.Aviso "Notificación actualizada exitosamente"
// @Failure 400 {object} domain.ErrorResponse "ID de notificación no proporcionado"
// @Failure 400 {object} domain.ErrorResponse "Datos inválidos"
// @Failure 400 {object} domain.ErrorResponse "Error al actualizar la notificación"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /notification/{id} [put]
func (n *notificationController) UpdateNotification(c *gin.Context) {
	n.notificationUseCase.UpdateNotification(c)
}

// GetNotifications maneja la solicitud para obtener todas las notificaciones.
// @Summary Obtener todas las notificaciones
// @Description Obtiene una lista de todas las notificaciones del usuario autenticado. Requiere autenticación.
// @Tags Notificaciones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} domain.Aviso "Lista de notificaciones obtenida exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Error al obtener notificaciones"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /notification [get]
func (n *notificationController) GetNotifications(c *gin.Context) {
	n.notificationUseCase.GetNotifications(c)
}

// GetUnreadNotifications maneja la solicitud para obtener notificaciones no leídas.
// @Summary Obtener notificaciones no leídas
// @Description Obtiene una lista de todas las notificaciones no leídas del usuario autenticado. Requiere autenticación.
// @Tags Notificaciones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} domain.Aviso "Lista de notificaciones no leídas obtenida exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Error al obtener notificaciones no leídas"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /notification/unread [get]
func (n *notificationController) GetUnreadNotifications(c *gin.Context) {
	n.notificationUseCase.GetUnreadNotifications(c)
}

// GetReadNotifications maneja la solicitud para obtener notificaciones leídas.
// @Summary Obtener notificaciones leídas
// @Description Obtiene una lista de todas las notificaciones leídas del usuario autenticado. Requiere autenticación.
// @Tags Notificaciones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} domain.Aviso "Lista de notificaciones leídas obtenida exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Error al obtener notificaciones leídas"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /notification/read [get]
func (n *notificationController) GetReadNotifications(c *gin.Context) {
	n.notificationUseCase.GetReadNotifications(c)
}

// MarkNotificationAsRead maneja la solicitud para marcar una notificación como leída.
// @Summary Marcar notificación como leída
// @Description Marca una notificación específica como leída mediante su ID. Requiere autenticación.
// @Tags Notificaciones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID de la notificación"
// @Success 200 {object} domain.SuccessResponse "Notificación marcada como leída exitosamente"
// @Failure 400 {object} domain.ErrorResponse "ID de notificación no proporcionado"
// @Failure 400 {object} domain.ErrorResponse "Error al marcar notificación como leída"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /notification/read/{id} [put]
func (n *notificationController) MarkNotificationAsRead(c *gin.Context) {
	n.notificationUseCase.MarkNotificationAsRead(c)
}
