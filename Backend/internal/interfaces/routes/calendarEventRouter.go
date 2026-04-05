package routes

import (
	"github.com/SebaVCH/hdcProject/internal/infrastructure/database"
	"github.com/SebaVCH/hdcProject/internal/interfaces/controller"
	"github.com/SebaVCH/hdcProject/internal/interfaces/middleware"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/usecase"
	"github.com/gin-gonic/gin"
)

// SetupCalendarEventRouter configura las rutas para los eventos del calendario.
// Crea el repositorio de eventos del calendario, el caso de uso y el controlador, y define las rutas para crear, obtener, actualizar y eliminar eventos.
func SetupCalendarEventRouter(r *gin.Engine) {
	calendarEventRepo := repository.NewCalendarEventRepository(database.Client.Database("pip").Collection("calendar_events"))
	calendarEventUseCase := usecase.NewCalendarEventUseCase(calendarEventRepo)
	calendarEventController := controller.NewCalendarEventController(calendarEventUseCase)

	protected := r.Group("/calendar-event")
	protected.Use(middleware.AuthMiddleware())
	protected.POST("", calendarEventController.CreateCalendarEvent)
	protected.GET("", calendarEventController.GetAllCalendarEvents)
	protected.PUT("/:id", calendarEventController.UpdateCalendarEvent)
	protected.DELETE("/:id", calendarEventController.DeleteCalendarEvent)
}
