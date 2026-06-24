package usecase

import (
	"fmt"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/xuri/excelize/v2"
	"net/http"
)

// RouteUseCase define la interfaz para las operaciones relacionadas con rutas.
// Contiene métodos para obtener, crear, actualizar, eliminar rutas, finalizar rutas y unirse a ellas.
type RouteUseCase interface {
	FindAll(c *gin.Context)
	FindByID(c *gin.Context)
	CreateRoute(c *gin.Context)
	UpdateRoute(c *gin.Context)
	DeleteRoute(c *gin.Context)
	FinishRoute(c *gin.Context)
	JoinRoute(c *gin.Context)
	LeaveRoute(c *gin.Context)
	GetMyParticipation(c *gin.Context)
	ExportReport(c *gin.Context)
}

// routeUseCase implementa la interfaz RouteUseCase.
// Contiene un repositorio de rutas para interactuar con la base de datos.
type routeUseCase struct {
	routeRepository repository.RouteRepository
}

// NewRouteUseCase crea una nueva instancia de routeUseCase.
// Recibe un repositorio de rutas y retorna una instancia de RouteUseCase.
func NewRouteUseCase(repo repository.RouteRepository) RouteUseCase {
	return &routeUseCase{routeRepository: repo}
}

// FindAll maneja la solicitud para obtener todas las rutas.
// Retorna un JSON con todas las rutas o un error si ocurre algún problema.
func (r routeUseCase) FindAll(c *gin.Context) {
	routes, err := r.routeRepository.FindAll()
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener rutas"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": routes})
}

// FindByID maneja la solicitud para obtener una ruta por su ID.
// Retorna un JSON con la ruta encontrada o un error si no se encuentra.
func (r routeUseCase) FindByID(c *gin.Context) {
	id := c.Param("id")
	route, err := r.routeRepository.FindByID(id)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Ruta no encontrada"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": route})
}

// CreateRoute maneja la solicitud para crear una nueva ruta.
// Valida los datos de entrada y verifica que el título y la descripción no contengan caracteres inválidos.
func (r routeUseCase) CreateRoute(c *gin.Context) {
	var route domain.Route
	if err := c.ShouldBindJSON(&route); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.IsValidString(route.Title) || !utils.IsValidString(route.Description) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	err := r.routeRepository.CreateRoute(&route)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear la ruta"})
		return
	}

	c.IndentedJSON(http.StatusCreated, gin.H{"message": route})
}

// UpdateRoute maneja la solicitud para actualizar una ruta existente.
// Verifica que el ID de la ruta sea válido y que los datos de entrada sean correctos.
func (r routeUseCase) UpdateRoute(c *gin.Context) {
	routeID := c.Param("id")
	if routeID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de ruta no proporcionado"})
		return
	}
	var updateData map[string]interface{}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.SanitizeStringFields(c, updateData) {
		return
	}

	updateData["_id"] = routeID
	updatedRoute, err := r.routeRepository.UpdateRoute(updateData)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar la ruta"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": updatedRoute})
}

// DeleteRoute maneja la solicitud para eliminar una ruta por su ID.
// Si el ID no se proporciona, retorna un error 400 Bad Request.
func (r routeUseCase) DeleteRoute(c *gin.Context) {
	id := c.Param("id")
	err := r.routeRepository.DeleteRoute(id)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al eliminar la ruta"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Ruta eliminada correctamente"})
}

// FinishRoute maneja la solicitud para finalizar una ruta.
// Verifica que el ID de la ruta sea válido y que la ruta pueda ser finalizada.
func (r routeUseCase) FinishRoute(c *gin.Context) {
	routeID := c.Param("id")
	if routeID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de ruta no proporcionado"})
		return
	}

	err := r.routeRepository.FinishRoute(routeID)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al finalizar la ruta"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Ruta finalizada correctamente"})
}

// JoinRoute maneja la solicitud para unirse a una ruta utilizando un código de invitación.
// Verifica que el código de invitación sea válido y que el usuario esté autenticado.
func (r routeUseCase) JoinRoute(c *gin.Context) {
	inviteCode := c.Param("code")
	if inviteCode == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Código de invitación no proporcionado"})
		return
	}

	claims, exists := c.Get("user")
	if !exists {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	mapClaims, ok := claims.(jwt.MapClaims)
	if !ok {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	userID, ok := mapClaims["user_id"].(string)
	if !ok || userID == "" {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	route, err := r.routeRepository.JoinRoute(inviteCode, userID)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al unirse a la ruta"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": route})
}

// LeaveRoute maneja la solicitud para que un usuario salga de una ruta.
// Verifica que el ID de la ruta sea válido y que el usuario esté autenticado.
func (r routeUseCase) LeaveRoute(c *gin.Context) {
	routeID := c.Param("id")
	if routeID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de ruta no proporcionado"})
		return
	}

	claims, exists := c.Get("user")
	if !exists {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	mapClaims, ok := claims.(jwt.MapClaims)
	if !ok {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	userID, ok := mapClaims["user_id"].(string)
	if !ok || userID == "" {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	err := r.routeRepository.LeaveRoute(routeID, userID)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Saliste de la ruta correctamente"})
}

// GetMyParticipation maneja la solicitud para obtener la participación de un usuario en una ruta (cantidad de rutas y puntos de ayuda).
// Verifica que el ID del usuario sea válido y que el usuario tenga participaciones en rutas.
func (r routeUseCase) GetMyParticipation(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de usuario no encontrado"})
		return
	}

	participation, err := r.routeRepository.GetMyParticipation(userID)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener participaciones"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": participation})
}

// ExportReport genera un informe en Excel de una ruta con sus puntos de ayuda y personas ayudadas.
func (r routeUseCase) ExportReport(c *gin.Context) {
	routeID := c.Param("id")
	if routeID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de ruta no proporcionado"})
		return
	}

	route, err := r.routeRepository.FindByID(routeID)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Ruta no encontrada"})
		return
	}

	helpPoints, err := r.routeRepository.GetHelpPointsByRouteID(routeID)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener puntos de ayuda"})
		return
	}

	f := excelize.NewFile()
	sheetName := "Informe de Ruta"
	f.SetSheetName("Sheet1", sheetName)

	// Encabezado de la ruta
	f.SetCellValue(sheetName, "A1", "INFORME DE RUTA")
	f.SetCellValue(sheetName, "A2", "Título")
	f.SetCellValue(sheetName, "B2", route.Title)
	f.SetCellValue(sheetName, "A3", "Descripción")
	f.SetCellValue(sheetName, "B3", route.Description)
	f.SetCellValue(sheetName, "A4", "Estado")
	f.SetCellValue(sheetName, "B4", route.Status)
	f.SetCellValue(sheetName, "A5", "Fecha de creación")
	f.SetCellValue(sheetName, "B5", route.DateCreated.Format("2006-01-02 15:04:05"))
	f.SetCellValue(sheetName, "A6", "Fecha de finalización")
	if !route.DateFinished.IsZero() {
		f.SetCellValue(sheetName, "B6", route.DateFinished.Format("2006-01-02 15:04:05"))
	} else {
		f.SetCellValue(sheetName, "B6", "No finalizada")
	}
	f.SetCellValue(sheetName, "A7", "Código de invitación")
	f.SetCellValue(sheetName, "B7", route.InviteCode)

	// Tabla de puntos de ayuda
	row := 9
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "PUNTOS DE AYUDA")
	row++
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "N°")
	f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), "Coordenadas")
	f.SetCellValue(sheetName, fmt.Sprintf("C%d", row), "Fecha")
	f.SetCellValue(sheetName, fmt.Sprintf("D%d", row), "Comentario")
	f.SetCellValue(sheetName, fmt.Sprintf("E%d", row), "Personas Ayudadas")

	hpStart := row
	for i, hp := range helpPoints {
		row = hpStart + 1 + i
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), i+1)
		if len(hp.Coords) >= 2 {
			f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), fmt.Sprintf("%f, %f", hp.Coords[0], hp.Coords[1]))
		}
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", row), hp.DateRegister.Format("2006-01-02 15:04:05"))
		f.SetCellValue(sheetName, fmt.Sprintf("D%d", row), hp.Comment)

		peopleStr := ""
		for j, p := range hp.People {
			if j > 0 {
				peopleStr += "; "
			}
			peopleStr += fmt.Sprintf("%s (Edad: %d, Género: %s)", p.Name, p.Age, p.Gender)
		}
		f.SetCellValue(sheetName, fmt.Sprintf("E%d", row), peopleStr)
	}

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	filename := fmt.Sprintf("informe_ruta_%s.xlsx", route.Title)
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Header("Content-Transfer-Encoding", "binary")
	if err := f.Write(c.Writer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error al generar el informe"})
	}
}
