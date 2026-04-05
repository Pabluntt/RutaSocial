package routes

import (
	"github.com/SebaVCH/hdcProject/internal/infrastructure/database"
	"github.com/SebaVCH/hdcProject/internal/interfaces/controller"
	"github.com/SebaVCH/hdcProject/internal/interfaces/middleware"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// SetupExportDataRouter configura las rutas para la exportación de datos.
// Crea el repositorio de exportación de datos, el caso de uso y el controlador, y define las rutas para exportar datos de personas ayudadas.
func SetupExportDataRouter(r *gin.Engine) {
	exportDataRepo := repository.NewExportDataRepository(database.Client.Database("pip").Collection("people_helped"))
	exportDataUseCase := usecase.NewExportDataUseCase(exportDataRepo)
	exportDataController := controller.NewExportDataController(exportDataUseCase)

	protected := r.Group("/export-data")
	protected.Use(middleware.AuthMiddleware())
	protected.GET("/people-helped", middleware.RoleMiddleware("admin"), exportDataController.ExportPeopleHelped)
}
