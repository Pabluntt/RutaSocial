package dto

import (
	"github.com/SebaVCH/hdcProject/internal/domain"
)

// UserResponse es el DTO de respuesta para Usuario.
// Los tags JSON coinciden exactamente con los que el frontend espera.
// Password siempre se retorna como "" por seguridad.
type UserResponse struct {
	ID              string `json:"_id"`
	Name            string `json:"name"`
	Email           string `json:"email"`
	Phone           string `json:"phone"`
	Password        string `json:"password"`
	CompletedRoutes int    `json:"completed_routes"`
	ListRoutes      any    `json:"list_routes"`
	Role            string `json:"role"`
	InstitutionID   string `json:"institutionID"`
	DateRegister    string `json:"date_register"`
	IsActive        bool   `json:"is_active"`
}

type PublicUserResponse struct {
	ID            string `json:"_id"`
	Name          string `json:"name"`
	InstitutionID string `json:"institutionID"`
}

func MapUserToResponse(u domain.Usuario) UserResponse {
	return UserResponse{
		ID:              u.ID.Hex(),
		Name:            u.Name,
		Email:           u.Email,
		Phone:           u.Phone,
		Password:        "",
		CompletedRoutes: u.CompletedRoutes,
		ListRoutes:      u.ListRoutes,
		Role:            u.Role,
		InstitutionID:   u.InstitutionID.Hex(),
		DateRegister:    u.DateRegister.Format("2006-01-02T15:04:05Z"),
		IsActive:        u.Active(),
	}
}

func MapUsersToResponse(users []domain.Usuario) []UserResponse {
	result := make([]UserResponse, len(users))
	for i, u := range users {
		result[i] = MapUserToResponse(u)
	}
	return result
}

func MapUserToPublicResponse(u domain.Usuario) PublicUserResponse {
	return PublicUserResponse{
		ID:            u.ID.Hex(),
		Name:          u.Name,
		InstitutionID: u.InstitutionID.Hex(),
	}
}

func MapUsersToPublicResponse(users []domain.Usuario) []PublicUserResponse {
	result := make([]PublicUserResponse, len(users))
	for i, u := range users {
		result[i] = MapUserToPublicResponse(u)
	}
	return result
}
