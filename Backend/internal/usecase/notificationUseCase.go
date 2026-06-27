package usecase

import (
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"net/http"
)

// NotificationUseCase define la interfaz para las operaciones relacionadas con notificaciones.
// Contiene métodos para crear, eliminar, actualizar y obtener notificaciones, además de obtener notificaciones leídas y no leídas, y para marcar notificaciones como leídas.
type NotificationUseCase interface {
	CreateNotification(c *gin.Context)
	DeleteNotification(c *gin.Context)
	UpdateNotification(c *gin.Context)
	GetNotifications(c *gin.Context)
	GetUnreadNotifications(c *gin.Context)
	GetReadNotifications(c *gin.Context)
	MarkNotificationAsRead(c *gin.Context)
	DismissNotification(c *gin.Context)
}

// notificationUseCase implementa la interfaz NotificationUseCase.
// Contiene un repositorio de notificaciones para interactuar con la base de datos.
type notificationUseCase struct {
	notificationRepository repository.NotificationRepository
}

// NewNotificationUseCase crea una nueva instancia de notificationUseCase.
// Recibe un repositorio de notificaciones y retorna una instancia de NotificationUseCase.
func NewNotificationUseCase(notificationRepository repository.NotificationRepository) NotificationUseCase {
	return &notificationUseCase{
		notificationRepository: notificationRepository,
	}
}

// CreateNotification maneja la solicitud para crear una nueva notificación.
// Valida los datos de entrada y verifica que la descripción no contenga caracteres inválidos.
func (n notificationUseCase) CreateNotification(c *gin.Context) {
	var notification domain.Aviso
	if err := c.ShouldBindJSON(&notification); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.IsValidString(notification.Description) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Descripción con caracteres inválidos"})
		return
	}

	userID, userRole, ok := getAuthenticatedUserIDAndRole(c)
	if !ok {
		return
	}

	if notification.SendToAll && userRole != "admin" {
		c.IndentedJSON(http.StatusForbidden, gin.H{"error": "No tienes permiso para enviar avisos a todos"})
		return
	}

	authorID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}
	notification.AuthorID = authorID

	err = n.notificationRepository.CreateNotification(c.Request.Context(), notification)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear aviso"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": notification})
}

// DeleteNotification maneja la solicitud para eliminar una notificación por su ID.
// Verifica que el ID de la notificación sea válido y que el usuario tenga los permisos necesarios.
func (n notificationUseCase) DeleteNotification(c *gin.Context) {
	notificationID := c.Param("id")
	if notificationID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de aviso no proporcionado"})
		return
	}

	userID, userRole, ok := getAuthenticatedUserIDAndRole(c)
	if !ok {
		return
	}

	if userRole != "admin" {
		if err := n.notificationRepository.FindByIDAndUserID(c.Request.Context(), notificationID, userID); err != nil {
			c.IndentedJSON(http.StatusForbidden, gin.H{"error": "No tienes permiso para eliminar este aviso"})
			return
		}
	}

	err := n.notificationRepository.DeleteNotification(c.Request.Context(), notificationID)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al eliminar aviso"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Aviso eliminada correctamente"})
}

// UpdateNotification maneja la solicitud para actualizar una notificación existente.
// Verifica que el ID de la notificación sea válido y que el usuario tenga los permisos necesarios para actualizarla.
func (n notificationUseCase) UpdateNotification(c *gin.Context) {
	notificationID := c.Param("id")
	if notificationID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de aviso no proporcionado"})
		return
	}

	userID, userRole, ok := getAuthenticatedUserIDAndRole(c)
	if !ok {
		return
	}

	if userRole != "admin" {
		if err := n.notificationRepository.FindByIDAndUserID(c.Request.Context(), notificationID, userID); err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.SanitizeStringFields(c, updateData) {
		return
	}

	if _, ok := updateData["send_to_all"]; ok {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "No se puede modificar el alcance del aviso"})
		return
	}
	if _, ok := updateData["send_email"]; ok {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "No se puede modificar el envío por correo del aviso"})
		return
	}

	updateData["_id"] = notificationID
	updatedNotification, err := n.notificationRepository.UpdateNotification(c.Request.Context(), updateData)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar la aviso"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": updatedNotification})
}

// GetNotifications maneja la solicitud para obtener todas las notificaciones.
// Verifica que el usuario esté autenticado y obtiene las notificaciones desde el repositorio.
func (n notificationUseCase) GetNotifications(c *gin.Context) {

	notifications, err := n.notificationRepository.GetNotifications(c.Request.Context())
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener aviso"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": notifications})
}

// GetUnreadNotifications maneja la solicitud para obtener las notificaciones no leídas del usuario.
func (n notificationUseCase) GetUnreadNotifications(c *gin.Context) {
	userID, ok := getAuthenticatedUserID(c)
	if !ok {
		return
	}
	notifications, err := n.notificationRepository.GetUnreadNotifications(c.Request.Context(), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener aviso"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": notifications})
}

// GetReadNotifications maneja la solicitud para obtener las notificaciones leídas del usuario.
// Verifica que el usuario esté autenticado y obtiene las notificaciones leídas desde el repositorio.
func (n notificationUseCase) GetReadNotifications(c *gin.Context) {
	userID, ok := getAuthenticatedUserID(c)
	if !ok {
		return
	}
	notifications, err := n.notificationRepository.GetReadNotifications(c.Request.Context(), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener aviso"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": notifications})
}

// MarkNotificationAsRead maneja la solicitud para marcar una notificación como leída.
// Verifica que el ID de la notificación sea válido y actualiza su estado en la base de datos.
func (n notificationUseCase) MarkNotificationAsRead(c *gin.Context) {
	notificationID := c.Param("id")
	userID, ok := getAuthenticatedUserID(c)
	if !ok {
		return
	}
	err := n.notificationRepository.MarkNotificationAsRead(c.Request.Context(), notificationID, userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener aviso"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Aviso marcado como leído correctamente"})
}

// DismissNotification maneja la solicitud para ocultar una notificación de la vista del usuario.
// Verifica que el ID de la notificación sea válido y marca la relación como dismissed=true.
func (n notificationUseCase) DismissNotification(c *gin.Context) {
	notificationID := c.Param("id")
	if notificationID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de aviso no proporcionado"})
		return
	}

	userID, ok := getAuthenticatedUserID(c)
	if !ok {
		return
	}

	err := n.notificationRepository.DismissNotification(c.Request.Context(), notificationID, userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Error al ocultar aviso"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Aviso ocultado correctamente"})
}
