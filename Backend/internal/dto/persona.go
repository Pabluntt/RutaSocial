package dto

import "github.com/SebaVCH/hdcProject/internal/domain"

type PersonaSummaryResponse struct {
	ID                 string `json:"_id"`
	Nombre             string `json:"nombre"`
	Rut                string `json:"rut,omitempty"`
	Edad               int    `json:"edad"`
	Genero             string `json:"genero"`
	AntecedentesCount  int    `json:"antecedentes_count"`
	InfoMedicaCount    int    `json:"info_medica_count"`
	FechaCreacion      string `json:"fecha_creacion"`
	FechaActualizacion string `json:"fecha_actualizacion"`
}

func MapPersonaToSummaryResponse(p domain.Persona) PersonaSummaryResponse {
	return PersonaSummaryResponse{
		ID:                 p.ID.Hex(),
		Nombre:             p.Nombre,
		Rut:                p.Rut,
		Edad:               p.Edad,
		Genero:             p.Genero,
		AntecedentesCount:  len(p.Antecedentes),
		InfoMedicaCount:    len(p.InfoMedica),
		FechaCreacion:      p.FechaCreacion.Format("2006-01-02T15:04:05Z"),
		FechaActualizacion: p.FechaActualizacion.Format("2006-01-02T15:04:05Z"),
	}
}

func MapPersonasToSummaryResponse(personas []domain.Persona) []PersonaSummaryResponse {
	result := make([]PersonaSummaryResponse, len(personas))
	for i, persona := range personas {
		result[i] = MapPersonaToSummaryResponse(persona)
	}
	return result
}
