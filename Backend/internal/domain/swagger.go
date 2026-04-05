package domain

// LoginRequest representa el cuerpo de la petición para el login.
type LoginRequest struct {
	Email    string `json:"email" binding:"required" example:"usuario@ejemplo.com"`
	Password string `json:"password" binding:"required" example:"password123"`
}

// RegisterRequest representa el cuerpo de la petición para el registro.
type RegisterRequest struct {
	Name          string `json:"name" binding:"required" example:"Juan Pérez"`
	Email         string `json:"email" binding:"required" example:"juan@ejemplo.com"`
	Password      string `json:"password" binding:"required" example:"password123"`
	Phone         string `json:"phone" binding:"required" example:"+56912345678"`
	Role          string `json:"role" binding:"required" example:"voluntario"`
	InstitutionID string `json:"institutionID" binding:"required" example:"507f1f77bcf86cd799439011"`
}

// InstitutionRequest representa el cuerpo de la petición para crear o actualizar una institución.
type InstitutionRequest struct {
	Name  string `json:"name" binding:"required" example:"Hogar de cristo"`
	Color string `json:"color" binding:"required" example:"#FF5733"`
}

// CalendarEventRequest representa el cuerpo de la petición para crear un evento en el calendario.
type CalendarEventRequest struct {
	Title       string `json:"title" binding:"required" example:"Reunión de voluntarios"`
	Description string `json:"description" binding:"required" example:"Reunión mensual para coordinar actividades"`
	TimeStart   string `json:"time_start" binding:"required" example:"10:00"`
	TimeEnd     string `json:"time_end" binding:"required" example:"12:00"`
	AuthorID    string `json:"author_id" binding:"required" example:"507f1f77bcf86cd799439011"`
}

// HelpPointRequest representa el cuerpo de la petición para crear un punto de ayuda.
type HelpPointRequest struct {
	Coords       []float64      `json:"coords" binding:"required" example:"-33.4489,-70.6693"`
	PeopleHelped PersonaAyudada `json:"people_helped" binding:"required"`
}

// RiskRequest representa el cuerpo de la petición para crear un riesgo.
type RiskRequest struct {
	Coords      []float64 `json:"coords" binding:"required" example:"-33.4489,-70.6693"`
	Status      string    `json:"status" binding:"required" example:"activo"`
	Description string    `json:"description" binding:"required" example:"Descripción del riesgo"`
}

// NotificationRequest representa el cuerpo de la petición para crear una notificación.
type NotificationRequest struct {
	Description string `json:"description" binding:"required" example:"Descripción de la notificación"`
	SendEmail   bool   `json:"send_email" binding:"required" example:"true"`
}

// RouteRequest representa el cuerpo de la petición para crear o actualizar una ruta.
type RouteRequest struct {
	Title       string `json:"title" binding:"required" example:"Ruta al centro de Coquimbo"`
	Description string `json:"description" binding:"required" example:"Ruta para ayudar a las personas afectadas por el frio en Coquimbo"`
}

// AuthResponse representa la respuesta exitosa del login/registro.
type AuthResponse struct {
	Token string `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}

// ErrorResponse representa una respuesta de error estándar de la API.
type ErrorResponse struct {
	Error string `json:"error" example:"Mensaje de error genérico"`
}

// SuccessResponse representa una respuesta de éxito estándar de la API.
type SuccessResponse struct {
	Success string `json:"message" example:"Mensaje de éxito genérico"`
}
