package usecase

import (
	"fmt"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
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
	GetUserRoutes(c *gin.Context)
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
	routes, err := r.routeRepository.FindAll(c.Request.Context())
	if err != nil {
		logUseCaseError(c, "route.find_all", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener rutas"})
		return
	}
	if utils.HasPagination(c) {
		paginated, meta := utils.PaginateSlice(c, routes)
		c.IndentedJSON(http.StatusOK, gin.H{"message": paginated, "pagination": meta})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": routes})
}

// FindByID maneja la solicitud para obtener una ruta por su ID.
// Retorna un JSON con la ruta encontrada o un error si no se encuentra.
func (r routeUseCase) FindByID(c *gin.Context) {
	id := c.Param("id")
	route, err := r.routeRepository.FindByID(c.Request.Context(), id)
	if err != nil {
		logUseCaseWarn(c, "route.find_by_id", http.StatusBadRequest, err, "route_id", id)
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
		logUseCaseWarn(c, "route.create.bind_json", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.IsValidString(route.Title) || !utils.IsValidString(route.Description) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	err := r.routeRepository.CreateRoute(c.Request.Context(), &route)
	if err != nil {
		logUseCaseError(c, "route.create", http.StatusBadRequest, err)
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
		logUseCaseWarn(c, "route.update.bind_json", http.StatusBadRequest, err, "route_id", routeID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.SanitizeStringFields(c, updateData) {
		return
	}

	updateData["_id"] = routeID
	updatedRoute, err := r.routeRepository.UpdateRoute(c.Request.Context(), updateData)
	if err != nil {
		logUseCaseError(c, "route.update", http.StatusBadRequest, err, "route_id", routeID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar la ruta"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": updatedRoute})
}

// DeleteRoute maneja la solicitud para eliminar una ruta por su ID.
// Si el ID no se proporciona, retorna un error 400 Bad Request.
func (r routeUseCase) DeleteRoute(c *gin.Context) {
	id := c.Param("id")
	err := r.routeRepository.DeleteRoute(c.Request.Context(), id)
	if err != nil {
		logUseCaseWarn(c, "route.delete", http.StatusBadRequest, err, "route_id", id)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al eliminar la ruta"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Ruta eliminada correctamente"})
}

// FinishRoute maneja la solicitud para finalizar una ruta.
// Verifica que el ID de la ruta sea válido, que el usuario autenticado sea el líder, y finaliza la ruta.
func (r routeUseCase) FinishRoute(c *gin.Context) {
	routeID := c.Param("id")
	if routeID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de ruta no proporcionado"})
		return
	}

	userID, ok := getAuthenticatedUserID(c)
	if !ok {
		return
	}

	err := r.routeRepository.FinishRoute(c.Request.Context(), routeID, userID)
	if err != nil {
		logUseCaseWarn(c, "route.finish", http.StatusForbidden, err, "route_id", routeID)
		c.IndentedJSON(http.StatusForbidden, gin.H{"error": "No tienes permiso para finalizar esta ruta"})
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

	userID, ok := getAuthenticatedUserID(c)
	if !ok {
		return
	}

	route, err := r.routeRepository.JoinRoute(c.Request.Context(), inviteCode, userID)
	if err != nil {
		logUseCaseWarn(c, "route.join", http.StatusBadRequest, err)
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

	userID, ok := getAuthenticatedUserID(c)
	if !ok {
		return
	}

	err := r.routeRepository.LeaveRoute(c.Request.Context(), routeID, userID)
	if err != nil {
		logUseCaseWarn(c, "route.leave", http.StatusBadRequest, err, "route_id", routeID)
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

	participation, err := r.routeRepository.GetMyParticipation(c.Request.Context(), userID)
	if err != nil {
		logUseCaseError(c, "route.get_my_participation", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener participaciones"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": participation})
}

// GetUserRoutes maneja la solicitud para obtener todas las rutas de un usuario (admin).
func (r routeUseCase) GetUserRoutes(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de usuario no proporcionado"})
		return
	}

	routes, err := r.routeRepository.GetRoutesByUserID(c.Request.Context(), userID)
	if err != nil {
		logUseCaseError(c, "route.get_user_routes", http.StatusBadRequest, err, "target_user_id", userID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener rutas del usuario"})
		return
	}
	if utils.HasPagination(c) {
		paginated, meta := utils.PaginateSlice(c, routes)
		c.IndentedJSON(http.StatusOK, gin.H{"message": paginated, "pagination": meta})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": routes})
}

// ExportReport genera un informe en Excel de una ruta con sus puntos de ayuda y personas ayudadas.
func (r routeUseCase) ExportReport(c *gin.Context) {
	routeID := c.Param("id")
	if routeID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de ruta no proporcionado"})
		return
	}

	route, err := r.routeRepository.FindByID(c.Request.Context(), routeID)
	if err != nil {
		logUseCaseWarn(c, "route.export_report.find_route", http.StatusBadRequest, err, "route_id", routeID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Ruta no encontrada"})
		return
	}

	helpPoints, err := r.routeRepository.GetHelpPointsByRouteID(c.Request.Context(), routeID)
	if err != nil {
		logUseCaseError(c, "route.export_report.get_help_points", http.StatusBadRequest, err, "route_id", routeID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener puntos de ayuda"})
		return
	}

	f := excelize.NewFile()

	titleStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Size: 16, Color: "FFFFFF"},
		Fill:      excelize.Fill{Type: "pattern", Pattern: 1, Color: []string{"2F5496"}},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})
	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Size: 11, Color: "FFFFFF"},
		Fill:      excelize.Fill{Type: "pattern", Pattern: 1, Color: []string{"4472C4"}},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "FFFFFF", Style: 1},
			{Type: "right", Color: "FFFFFF", Style: 1},
			{Type: "top", Color: "FFFFFF", Style: 1},
			{Type: "bottom", Color: "FFFFFF", Style: 1},
		},
	})
	labelStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Size: 11},
		Fill: excelize.Fill{Type: "pattern", Pattern: 1, Color: []string{"D6E4F0"}},
		Border: []excelize.Border{
			{Type: "left", Color: "999999", Style: 1},
			{Type: "right", Color: "999999", Style: 1},
			{Type: "top", Color: "999999", Style: 1},
			{Type: "bottom", Color: "999999", Style: 1},
		},
	})
	valueStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Size: 11},
		Border: []excelize.Border{
			{Type: "left", Color: "999999", Style: 1},
			{Type: "right", Color: "999999", Style: 1},
			{Type: "top", Color: "999999", Style: 1},
			{Type: "bottom", Color: "999999", Style: 1},
		},
	})
	dataStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Size: 10},
		Alignment: &excelize.Alignment{Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "CCCCCC", Style: 1},
			{Type: "right", Color: "CCCCCC", Style: 1},
			{Type: "top", Color: "CCCCCC", Style: 1},
			{Type: "bottom", Color: "CCCCCC", Style: 1},
		},
	})
	sectionStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Size: 13, Color: "2F5496"},
		Alignment: &excelize.Alignment{Vertical: "center"},
	})

	sheetName := "Informe de Ruta"
	f.SetSheetName("Sheet1", sheetName)

	f.SetColWidth(sheetName, "A", "A", 25)
	f.SetColWidth(sheetName, "B", "B", 10)
	f.SetColWidth(sheetName, "C", "C", 12)
	f.SetColWidth(sheetName, "D", "D", 40)
	f.SetColWidth(sheetName, "E", "E", 14)
	f.SetColWidth(sheetName, "F", "F", 22)

	f.MergeCell(sheetName, "A1", "F1")
	f.SetCellValue(sheetName, "A1", "INFORME DE RUTA")
	f.SetCellStyle(sheetName, "A1", "F1", titleStyle)
	f.SetRowHeight(sheetName, 1, 45)

	f.SetCellValue(sheetName, "A3", "Información de la Ruta")
	f.SetCellStyle(sheetName, "A3", "F3", sectionStyle)

	infoData := []struct {
		label string
		value string
	}{
		{"Título", route.Title},
		{"Descripción", route.Description},
		{"Estado", route.Status},
		{"Fecha de creación", route.DateCreated.Format("2006-01-02 15:04:05")},
		{"Fecha de finalización", func() string {
			if !route.DateFinished.IsZero() {
				return route.DateFinished.Format("2006-01-02 15:04:05")
			}
			return "No finalizada"
		}()},
		{"Código de invitación", route.InviteCode},
	}

	for i, info := range infoData {
		row := 4 + i
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), info.label)
		f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), labelStyle)
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), info.value)
		f.SetCellStyle(sheetName, fmt.Sprintf("B%d", row), fmt.Sprintf("F%d", row), valueStyle)
	}

	personStart := 12
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", personStart), "Personas Ayudadas")
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", personStart), fmt.Sprintf("F%d", personStart), sectionStyle)

	personHeader := personStart + 1
	personCols := []string{"A", "B", "C", "D", "E", "F"}
	personHeaders := []string{"Nombre", "Edad", "Género", "Descripción", "Punto N°", "Fecha del Punto"}
	for i, h := range personHeaders {
		f.SetCellValue(sheetName, fmt.Sprintf("%s%d", personCols[i], personHeader), h)
	}
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", personHeader), fmt.Sprintf("F%d", personHeader), headerStyle)
	f.SetRowHeight(sheetName, personHeader, 22)

	getComment := func(hp domain.PuntoAyuda) string {
		if hp.Comment != "" {
			return hp.Comment
		}
		return ""
	}

	currentRow := personHeader
	for pi, hp := range helpPoints {
		people := hp.People
		if len(people) == 0 && hp.PeopleHelped.Name != "" {
			people = []domain.PersonaAyudada{hp.PeopleHelped}
		}
		for _, p := range people {
			currentRow++
			f.SetCellValue(sheetName, fmt.Sprintf("A%d", currentRow), p.Name)
			f.SetCellValue(sheetName, fmt.Sprintf("B%d", currentRow), p.Age)
			f.SetCellValue(sheetName, fmt.Sprintf("C%d", currentRow), p.Gender)
			f.SetCellValue(sheetName, fmt.Sprintf("D%d", currentRow), getComment(hp))
			f.SetCellValue(sheetName, fmt.Sprintf("E%d", currentRow), pi+1)
			f.SetCellValue(sheetName, fmt.Sprintf("F%d", currentRow), hp.DateRegister.Format("2006-01-02 15:04:05"))
			f.SetCellStyle(sheetName, fmt.Sprintf("A%d", currentRow), fmt.Sprintf("F%d", currentRow), dataStyle)
		}
	}

	pointStart := currentRow + 3
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", pointStart), "Puntos de Ayuda")
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", pointStart), fmt.Sprintf("D%d", pointStart), sectionStyle)

	pointHeader := pointStart + 1
	pointCols := []string{"A", "B", "C", "D"}
	pointHeaders := []string{"N°", "Coordenadas", "Fecha", "Comentario"}
	for i, h := range pointHeaders {
		f.SetCellValue(sheetName, fmt.Sprintf("%s%d", pointCols[i], pointHeader), h)
	}
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", pointHeader), fmt.Sprintf("D%d", pointHeader), headerStyle)
	f.SetRowHeight(sheetName, pointHeader, 22)

	for i, hp := range helpPoints {
		row := pointHeader + 1 + i
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), i+1)
		if len(hp.Coords) >= 2 {
			f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), fmt.Sprintf("%.6f, %.6f", hp.Coords[0], hp.Coords[1]))
		}
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", row), hp.DateRegister.Format("2006-01-02 15:04:05"))

		f.SetCellValue(sheetName, fmt.Sprintf("D%d", row), hp.Comment)
		f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("D%d", row), dataStyle)
	}

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	filename := fmt.Sprintf("informe_ruta_%s.xlsx", utils.SafeFilename(route.Title))
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Header("Content-Transfer-Encoding", "binary")
	if err := f.Write(c.Writer); err != nil {
		logUseCaseError(c, "route.export_report.write", http.StatusBadRequest, err, "route_id", routeID)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error al generar el informe"})
	}
}
