package controller

import (
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// helpPointController es la estructura que implementa los controladores de puntos de ayuda.
// Contiene una instancia del caso de uso de puntos de ayuda para manejar las solicitudes de creación, obtención, actualización y eliminación de puntos de ayuda.
type helpPointController struct {
	helpPointUseCase usecase.HelpingPointUseCase
}

func NewHelpPointController(helpPointUseCase usecase.HelpingPointUseCase) *helpPointController {
	return &helpPointController{
		helpPointUseCase: helpPointUseCase,
	}
}

// GetAllPoints maneja la solicitud para obtener todos los puntos de ayuda.
// @Summary Obtener todos los puntos de ayuda
// @Description Obtiene una lista de todos los puntos de ayuda registrados en el sistema. Requiere autenticación.
// @Tags Puntos de Ayuda
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} domain.PuntoAyuda "Lista de puntos de ayuda obtenida exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Error al obtener puntos de ayuda"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /helping-point [get]
func (h *helpPointController) GetAllPoints(c *gin.Context) {
	h.helpPointUseCase.GetAllPoints(c)
}

// CreateHelpingPoint maneja la solicitud para crear un nuevo punto de ayuda.
// @Summary Crear nuevo punto de ayuda
// @Description Crea un nuevo punto de ayuda en el sistema. Requiere autenticación.
// @Tags Puntos de Ayuda
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param helpPoint body domain.HelpPointRequest true "Datos del nuevo punto de ayuda"
// @Success 200 {object} domain.PuntoAyuda "Punto de ayuda creado exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Datos inválidos"
// @Failure 400 {object} domain.ErrorResponse "Se presentaron caracteres inválidos en el género o nombre de la persona ayudada"
// @Failure 400 {object} domain.ErrorResponse "Error al crear punto de ayuda"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /helping-point [post]
func (h *helpPointController) CreateHelpingPoint(c *gin.Context) {
	h.helpPointUseCase.CreateHelpingPoint(c)
}

// UpdateHelpingPoint maneja la solicitud para actualizar un punto de ayuda existente.
// @Summary Actualizar punto de ayuda
// @Description Actualiza los datos de un punto de ayuda existente. Los usuarios solo pueden actualizar sus propios puntos de ayuda. Requiere autenticación.
// @Tags Puntos de Ayuda
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID del punto de ayuda"
// @Param helpPoint body object true "Datos actualizados del punto de ayuda"
// @Success 200 {object} domain.PuntoAyuda "Punto de ayuda actualizado exitosamente"
// @Failure 400 {object} domain.ErrorResponse "ID de punto no proporcionado"
// @Failure 400 {object} domain.ErrorResponse "Punto de ayuda no encontrado"
// @Failure 400 {object} domain.ErrorResponse "Datos inválidos"
// @Failure 400 {object} domain.ErrorResponse "Error al actualizar el punto de ayuda"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /helping-point/{id} [put]
func (h *helpPointController) UpdateHelpingPoint(c *gin.Context) {
	h.helpPointUseCase.UpdateHelpingPoint(c)
}

// DeleteHelpingPoint maneja la solicitud para eliminar un punto de ayuda.
// @Summary Eliminar punto de ayuda
// @Description Elimina un punto de ayuda del sistema. Los usuarios solo pueden eliminar sus propios puntos de ayuda. Requiere autenticación.
// @Tags Puntos de Ayuda
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID del punto de ayuda"
// @Success 200 {object} domain.SuccessResponse "Punto de ayuda eliminado correctamente"
// @Failure 400 {object} domain.ErrorResponse "ID de punto de ayuda no proporcionado"
// @Failure 400 {object} domain.ErrorResponse "Punto de ayuda no encontrado"
// @Failure 400 {object} domain.ErrorResponse "Error al eliminar punto de ayuda"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /helping-point/{id} [delete]
func (h *helpPointController) DeleteHelpingPoint(c *gin.Context) {
	h.helpPointUseCase.DeleteHelpingPoint(c)
}
