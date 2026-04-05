package controller

import (
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// exportDataController es la estructura que implementa los controladores de exportación de datos.
// Contiene una instancia del caso de uso de exportación de datos para manejar las solicitudes de exportación de personas ayudadas.
type exportDataController struct {
	exportDataUseCase usecase.ExportDataUseCase
}

// NewExportDataController crea una nueva instancia de exportDataController.
// Recibe un caso de uso de exportación de datos y devuelve un puntero a exportDataController.
func NewExportDataController(exportDataUseCase usecase.ExportDataUseCase) *exportDataController {
	return &exportDataController{
		exportDataUseCase: exportDataUseCase,
	}
}

// ExportPeopleHelped maneja la exportación de datos de personas ayudadas a un archivo Excel.
// @Summary Exportar datos de personas ayudadas
// @Description Genera y descarga un archivo Excel con los datos de todas las personas ayudadas registradas en el sistema. Requiere autenticación y rol de administrador.
// @Tags Exportación
// @Accept json
// @Produce application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
// @Security BearerAuth
// @Success 200 {file} file "Archivo Excel generado exitosamente"
// @Failure 400 {object} domain.ErrorResponse "Error al obtener datos"
// @Failure 400 {object} domain.ErrorResponse "Error al generar el archivo Excel"
// @Failure 400 {object} domain.ErrorResponse "Acceso denegado"
// @Failure 401 {object} domain.ErrorResponse "No autorizado"
// @Failure 401 {object} domain.ErrorResponse "Token inválido"
// @Failure 401 {object} domain.ErrorResponse "Rol no encontrado"
// @Router /export-data/people-helped [get]
func (e *exportDataController) ExportPeopleHelped(c *gin.Context) {
	e.exportDataUseCase.ExportPeopleHelped(c)
}
