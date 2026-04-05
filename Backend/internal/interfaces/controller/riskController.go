package controller

import (
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// riskController es la estructura que implementa los controladores de riesgos.
// Contiene una instancia del caso de uso de riesgos para manejar las solicitudes de creación, obtención, actualización y eliminación de riesgos.
type riskController struct {
	riskUseCase usecase.RiskUseCase
}

// NewRiskController crea una nueva instancia de riskController.
// Recibe un caso de uso de riesgos y devuelve un puntero a riskController.
func NewRiskController(riskUseCase usecase.RiskUseCase) *riskController {
	return &riskController{
		riskUseCase: riskUseCase,
	}
}

// GetAllRisks maneja la solicitud para obtener todos los riesgos.
// @Summary Obtener todos los riesgos
// @Description Obtiene una lista de todos los riesgos registrados en el sistema. Requiere autenticación.
// @Tags Riesgos
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} domain.Riesgo "Lista de riesgos obtenida exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Error al obtener riesgos"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /risk [get]
func (r *riskController) GetAllRisks(c *gin.Context) {
	r.riskUseCase.GetAllRisks(c)
}

// CreateRisk maneja la solicitud para crear un nuevo riesgo.
// @Summary Crear nuevo riesgo
// @Description Crea un nuevo riesgo en el sistema. Requiere autenticación.
// @Tags Riesgos
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param risk body domain.RiskRequest true "Datos del nuevo riesgo"
// @Success 200 {object} domain.Riesgo "Riesgo creado exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Datos inválidos"
// @Failure 400 {object} domain.ErrorResponse "Descripción con caracteres inválidos"
// @Failure 400 {object} domain.ErrorResponse "Error al crear el riesgo"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /risk [post]
func (r *riskController) CreateRisk(c *gin.Context) {
	r.riskUseCase.CreateRisk(c)
}

// DeleteRisk maneja la solicitud para eliminar un riesgo por su ID.
// @Summary Eliminar riesgo
// @Description Elimina un riesgo del sistema mediante su ID. Requiere autenticación.
// @Tags Riesgos
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID del riesgo"
// @Success 200 {object} domain.SuccessResponse "Riesgo eliminado correctamente"
// @Failure 400 {object} domain.ErrorResponse "Error al eliminar el riesgo"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /risk/{id} [delete]
func (r *riskController) DeleteRisk(c *gin.Context) {
	r.riskUseCase.DeleteRisk(c)
}

// UpdateRisk maneja la solicitud para actualizar un riesgo existente.
// @Summary Actualizar riesgo
// @Description Actualiza los datos de un riesgo existente mediante su ID. Requiere autenticación.
// @Tags Riesgos
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID del riesgo"
// @Param risk body object true "Datos actualizados del riesgo"
// @Success 200 {object} domain.Riesgo "Riesgo actualizado exitosamente"
// @Failure 400 {object} domain.ErrorResponse "ID de riesgo no proporcionado"
// @Failure 400 {object} domain.ErrorResponse "Datos inválidos"
// @Failure 400 {object} domain.ErrorResponse "Error al actualizar el riesgo"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Router /risk/{id} [put]
func (r *riskController) UpdateRisk(c *gin.Context) {
	r.riskUseCase.UpdateRisk(c)
}
