package routes

import (
	"github.com/Pabluntt/RutaSocial/Backend/internal/config"
	"github.com/Pabluntt/RutaSocial/Backend/internal/domain"
	"github.com/Pabluntt/RutaSocial/Backend/internal/infrastructure/database"
	"github.com/Pabluntt/RutaSocial/Backend/internal/interfaces/controller"
	"github.com/Pabluntt/RutaSocial/Backend/internal/interfaces/middleware"
	"github.com/Pabluntt/RutaSocial/Backend/internal/repository"
	"github.com/Pabluntt/RutaSocial/Backend/internal/usecase"
	"github.com/gin-gonic/gin"
)

// SetupExportDataRouter configura las rutas para la exportación de datos.
// Crea el repositorio de exportación de datos, el caso de uso y el controlador, y define las rutas para exportar datos de personas ayudadas.
func SetupExportDataRouter(r *gin.Engine) {
	exportDataRepo := repository.NewExportDataRepository(database.Client.Database(config.DBName).Collection("people_helped"))
	exportDataUseCase := usecase.NewExportDataUseCase(exportDataRepo)
	exportDataController := controller.NewExportDataController(exportDataUseCase)

	protected := r.Group("/export-data")
	protected.Use(middleware.AuthMiddleware())
	protected.GET("/people-helped", middleware.RoleMiddleware(domain.RoleAdmin), exportDataController.ExportPeopleHelped)
}
