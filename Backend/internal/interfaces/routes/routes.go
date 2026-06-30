package routes

import (
	"context"
	"net/http"
	"time"

	"github.com/SebaVCH/hdcProject/internal/config"
	"github.com/SebaVCH/hdcProject/internal/infrastructure/database"
	"github.com/SebaVCH/hdcProject/internal/interfaces/middleware"
	"github.com/gin-gonic/gin"
	"github.com/swaggo/files"
	"github.com/swaggo/gin-swagger"
	"go.mongodb.org/mongo-driver/v2/bson"

	"github.com/SebaVCH/hdcProject/docs"
)

// SetupRouter permite incorporar todas las rutas a utilizar en la aplicación.
// Configura el modo de Gin, inicializa el enrutador, aplica middleware CORS y define las rutas para la documentación Swagger y los diferentes controladores.
func SetupRouter() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	r.MaxMultipartMemory = 10 << 20 // 10 MB

	// Deshabilitar redirect automático de trailing slash
	r.RedirectTrailingSlash = false

	// CORS middleware debe ser el primero en la cadena de middlewares
	// Insertamos al inicio usando `Use` que lo añade al inicio
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.CSPMiddleware())
	r.Use(middleware.BodySizeLimit(10 << 20)) // 10 MB limit
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	r.GET("/readyz", func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
		defer cancel()
		if database.Client == nil || database.Client.Ping(ctx, nil) != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "unavailable"})
			return
		}
		if err := database.Client.Database(config.DBName).RunCommand(ctx, bson.D{{Key: "ping", Value: 1}}).Err(); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "unavailable"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ready"})
	})

	if config.AppEnv != "production" {
		docs.SwaggerInfo.BasePath = "/"
		r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

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
	SetupAlojamientoRouter(r)
	SetupPersonaRouter(r)
	SetupWeatherRouter(r)
	return r
}
