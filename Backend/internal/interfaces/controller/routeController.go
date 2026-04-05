package controller

import (
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// routeController es la estructura que implementa los controladores de rutas.
// Contiene una instancia del caso de uso de rutas para manejar las solicitudes de creación, obtención, actualización y eliminación de rutas.
type routeController struct {
	routeUseCase usecase.RouteUseCase
}

// NewRouteController crea una nueva instancia de routeController.
// Recibe un caso de uso de rutas y devuelve un puntero a routeController.
func NewRouteController(routeUseCase usecase.RouteUseCase) *routeController {
	return &routeController{
		routeUseCase: routeUseCase,
	}
}

// FindAll maneja la solicitud para obtener todas las rutas.
// @Summary Obtener todas las rutas
// @Description Obtiene una lista de todas las rutas sociales disponibles en el sistema. Requiere autenticación.
// @Tags Rutas
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} domain.Route "Lista de rutas obtenida exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Error al obtener rutas"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /route [get]
func (r *routeController) FindAll(c *gin.Context) {
	r.routeUseCase.FindAll(c)
}

// FindByID maneja la solicitud para obtener una ruta por su ID.
// @Summary Obtener ruta por ID
// @Description Obtiene los detalles de una ruta específica mediante su ID. Requiere autenticación.
// @Tags Rutas
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID de la ruta"
// @Success 200 {object} domain.Route "Ruta obtenida exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Ruta no encontrada"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /route/{id} [get]
func (r *routeController) FindByID(c *gin.Context) {
	r.routeUseCase.FindByID(c)
}

// CreateRoute maneja la solicitud para crear una nueva ruta.
// @Summary Crear nueva ruta
// @Description Crea una nueva ruta social en el sistema. Requiere autenticación.
// @Tags Rutas
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param route body domain.RouteRequest true "Datos de la nueva ruta"
// @Success 201 {object} domain.Route "Ruta creada exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Datos inválidos"
// @Failure 400 {object} domain.ErrorResponse "Error al crear la ruta"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /route [post]
func (r *routeController) CreateRoute(c *gin.Context) {
	r.routeUseCase.CreateRoute(c)
}

// UpdateRoute maneja la solicitud para actualizar una ruta existente.
// @Summary Actualizar ruta
// @Description Actualiza los datos de una ruta existente mediante su ID. Requiere autenticación.
// @Tags Rutas
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID de la ruta"
// @Param route body object true "Datos actualizados de la ruta"
// @Success 200 {object} domain.Route "Ruta actualizada exitosamente"
// @Failure 400 {object} domain.ErrorResponse "ID de ruta no proporcionado"
// @Failure 400 {object} domain.ErrorResponse "Datos inválidos"
// @Failure 400 {object} domain.ErrorResponse "Error al actualizar la ruta"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /route/{id} [put]
func (r *routeController) UpdateRoute(c *gin.Context) {
	r.routeUseCase.UpdateRoute(c)
}

// DeleteRoute maneja la solicitud para eliminar una ruta por su ID.
// @Summary Eliminar ruta
// @Description Elimina una ruta del sistema mediante su ID. Requiere autenticación.
// @Tags Rutas
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID de la ruta"
// @Success 200 {object} domain.SuccessResponse "Ruta eliminada correctamente"
// @Failure 400 {object} domain.ErrorResponse "Error al eliminar la ruta"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /route/{id} [delete]
func (r *routeController) DeleteRoute(c *gin.Context) {
	r.routeUseCase.DeleteRoute(c)
}

// FinishRoute maneja la solicitud para finalizar una ruta.
// @Summary Finalizar ruta
// @Description Marca una ruta como finalizada mediante su ID. Requiere autenticación.
// @Tags Rutas
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID de la ruta"
// @Success 200 {object} domain.SuccessResponse "Ruta finalizada correctamente"
// @Failure 400 {object} domain.ErrorResponse "ID de ruta no proporcionado"
// @Failure 400 {object} domain.ErrorResponse "Error al finalizar la ruta"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /route/finish/{id} [put]
func (r *routeController) FinishRoute(c *gin.Context) {
	r.routeUseCase.FinishRoute(c)
}

// JoinRoute maneja la solicitud para unirse a una ruta utilizando un código de invitación.
// @Summary Unirse a ruta
// @Description Permite a un usuario unirse a una ruta existente mediante un código de invitación. Requiere autenticación.
// @Tags Rutas
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param code path string true "Código de invitación de la ruta"
// @Success 200 {object} domain.Route "Usuario unido a la ruta exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Código de invitación no proporcionado"
// @Failure 400 {object} domain.ErrorResponse "Error al unirse a la ruta"
// @Failure 401 {object} domain.ErrorResponse "Usuario no autenticado"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /route/join/{code} [post]
func (r *routeController) JoinRoute(c *gin.Context) {
	r.routeUseCase.JoinRoute(c)
}

// GetMyParticipation maneja la solicitud para obtener la participación de un usuario en rutas.
// @Summary Obtener participación del usuario
// @Description Obtiene información sobre la participación de un usuario en rutas (cantidad de rutas y puntos de ayuda). Requiere autenticación.
// @Tags Rutas
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID del usuario"
// @Success 200 {object} object "Participación del usuario obtenida exitosamente"
// @Failure 400 {object} domain.ErrorResponse "ID de usuario no encontrado"
// @Failure 400 {object} domain.ErrorResponse "Error al obtener participaciones"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /route/participation/{id} [get]
func (r *routeController) GetMyParticipation(c *gin.Context) {
	r.routeUseCase.GetMyParticipation(c)
}
