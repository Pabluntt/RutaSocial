package controller

import (
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// InstitutionController es la estructura que implementa los controladores de instituciones.
// Contiene una instancia del caso de uso de instituciones para manejar las solicitudes de creación, obtención, actualización y eliminación de instituciones.
type InstitutionController struct {
	institutionUseCase usecase.InstitutionUseCase
}

// NewInstitutionController crea una nueva instancia de InstitutionController.
// Recibe un caso de uso de instituciones y devuelve un puntero a InstitutionController.
func NewInstitutionController(institutionUseCase usecase.InstitutionUseCase) *InstitutionController {
	return &InstitutionController{
		institutionUseCase: institutionUseCase,
	}
}

// GetAllInstitutions maneja la solicitud para obtener todas las instituciones.
// @Summary Obtener todas las instituciones
// @Description Obtiene una lista de todas las instituciones registradas en el sistema. Requiere autenticación y rol de administrador.
// @Tags Instituciones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} domain.Institution "Lista de instituciones obtenida exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Error al obtener las instituciones"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Rol no encontrado"
// @Router /institution [get]
func (i *InstitutionController) GetAllInstitutions(c *gin.Context) {
	i.institutionUseCase.GetAllInstitutions(c)
}

// GetInstitutionByID maneja la solicitud para obtener una institución por su ID.
// @Summary Obtener institución por ID
// @Description Obtiene una institución específica mediante su ID. Requiere autenticación y rol de administrador.
// @Tags Instituciones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID de la institución"
// @Success 200 {object} domain.Institution "Institución obtenida exitosamente"
// @Failure 400 {object} domain.ErrorResponse "ID de institución no proporcionado"
// @Failure 400 {object} domain.ErrorResponse "Error al obtener la institución"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Failure 401 {object} domain.ErrorResponse "Rol no encontrado"
// @Router /institution/{id} [get]
func (i *InstitutionController) GetInstitutionByID(c *gin.Context) {
	i.institutionUseCase.GetInstitutionByID(c)
}

// CreateInstitution maneja la solicitud para crear una nueva institución.
// @Summary Crear nueva institución
// @Description Crea una nueva institución en el sistema. Requiere autenticación y rol de administrador.
// @Tags Instituciones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param institution body domain.InstitutionRequest true "Datos de la nueva institución"
// @Success 200 {object} domain.SuccessResponse "Institución creada con éxito"
// @Failure 400 {object} domain.ErrorResponse "Datos inválidos"
// @Failure 400 {object} domain.ErrorResponse "El nombre o el color presentan caracteres no permitidos"
// @Failure 400 {object} domain.ErrorResponse "Error al crear la institución"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Failure 401 {object} domain.ErrorResponse "Rol no encontrado"
// @Router /institution [post]
func (i *InstitutionController) CreateInstitution(c *gin.Context) {
	i.institutionUseCase.CreateInstitution(c)
}

// UpdateInstitution maneja la solicitud para actualizar una institución existente.
// @Summary Actualizar institución
// @Description Actualiza los datos de una institución existente. Requiere autenticación y rol de administrador.
// @Tags Instituciones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID de la institución"
// @Param institution body object true "Datos actualizados de la institución"
// @Success 200 {object} domain.SuccessResponse "Institución actualizada correctamente"
// @Failure 400 {object} domain.ErrorResponse "ID de institución no proporcionado"
// @Failure 400 {object} domain.ErrorResponse "Institución no encontrada"
// @Failure 400 {object} domain.ErrorResponse "Datos inválidos"
// @Failure 400 {object} domain.ErrorResponse "El nombre presenta caracteres no permitidos"
// @Failure 400 {object} domain.ErrorResponse "El color presenta caracteres no permitidos"
// @Failure 400 {object} domain.ErrorResponse "Error al actualizar la institución"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Failure 401 {object} domain.ErrorResponse "Rol no encontrado"
// @Router /institution/{id} [put]
func (i *InstitutionController) UpdateInstitution(c *gin.Context) {
	i.institutionUseCase.UpdateInstitution(c)
}

// DeleteInstitution maneja la solicitud para eliminar una institución por su ID.
// @Summary Eliminar institución
// @Description Elimina una institución del sistema mediante su ID. Requiere autenticación y rol de administrador.
// @Tags Instituciones
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID de la institución"
// @Success 200 {object} domain.SuccessResponse "Institución eliminada correctamente"
// @Failure 400 {object} domain.ErrorResponse "ID de institución no proporcionado"
// @Failure 400 {object} domain.ErrorResponse "Institución no encontrada"
// @Failure 400 {object} domain.ErrorResponse "Error al eliminar la institución"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Failure 401 {object} domain.ErrorResponse "Rol no encontrado"
// @Router /institution/{id} [delete]
func (i *InstitutionController) DeleteInstitution(c *gin.Context) {
	i.institutionUseCase.DeleteInstitution(c)
}
