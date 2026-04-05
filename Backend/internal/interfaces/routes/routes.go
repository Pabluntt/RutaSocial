package routes

import (
	"github.com/SebaVCH/hdcProject/internal/interfaces/middleware"
	"github.com/gin-gonic/gin"
	"github.com/swaggo/files"
	"github.com/swaggo/gin-swagger"

	"github.com/SebaVCH/hdcProject/docs"
)

// SetupRouter permite incorporar todas las rutas a utilizar en la aplicación.
// Configura el modo de Gin, inicializa el enrutador, aplica middleware CORS y define las rutas para la documentación Swagger y los diferentes controladores.
func SetupRouter() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	docs.SwaggerInfo.BasePath = "/"
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	SetupAuthRouter(r)
	SetupUserRouter(r)
	SetupRouteRouter(r)
	SetupRiskRouter(r)
	SetupHelpingPointRouter(r)
	SetupPeopleHelpedRouter(r)
	SetupNotificationRouter(r)
	SetupCalendarEventRouter(r)
	SetupExportDataRouter(r)
	SetupInstitutionRouter(r)
	return r
}
