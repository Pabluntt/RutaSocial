package usecase

import (
	"net/http"

	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
)

type PersonaUseCase interface {
	GetAll(c *gin.Context)
	GetByID(c *gin.Context)
	Search(c *gin.Context)
	Create(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)
	AddAntecedente(c *gin.Context)
	DeleteAntecedente(c *gin.Context)
	AddInfoMedica(c *gin.Context)
	DeleteInfoMedica(c *gin.Context)
}

type personaUseCase struct {
	repo repository.PersonaRepository
}

func NewPersonaUseCase(repo repository.PersonaRepository) PersonaUseCase {
	return &personaUseCase{repo: repo}
}

func (uc *personaUseCase) GetAll(c *gin.Context) {
	personas, err := uc.repo.GetAll()
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener personas"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": personas})
}

func (uc *personaUseCase) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID no proporcionado"})
		return
	}

	persona, err := uc.repo.GetByID(id)
	if err != nil {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": persona})
}

func (uc *personaUseCase) Search(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		uc.GetAll(c)
		return
	}

	personas, err := uc.repo.Search(query)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al buscar personas"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": personas})
}

func (uc *personaUseCase) Create(c *gin.Context) {
	var persona domain.Persona
	if err := c.ShouldBindJSON(&persona); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if persona.Nombre == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El nombre es obligatorio"})
		return
	}

	if !utils.IsValidString(persona.Nombre) || (persona.Genero != "" && !utils.IsValidString(persona.Genero)) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Se presentaron caracteres inválidos"})
		return
	}

	if persona.Rut != "" && !utils.IsValidRut(persona.Rut) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El formato del RUT no es válido"})
		return
	}

	if persona.Rut != "" {
		existing, err := uc.repo.GetByRut(persona.Rut)
		if err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al verificar RUT"})
			return
		}
		if existing.ID.Hex() != "" {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Ya existe una persona con ese RUT", "persona": existing})
			return
		}
	}

	created, err := uc.repo.Create(persona)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear persona"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": created})
}

func (uc *personaUseCase) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID no proporcionado"})
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

	if rut, ok := updateData["rut"].(string); ok && rut != "" && !utils.IsValidRut(rut) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "El formato del RUT no es válido"})
		return
	}

	updated, err := uc.repo.Update(id, updateData)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": updated})
}

func (uc *personaUseCase) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID no proporcionado"})
		return
	}

		err := uc.repo.Delete(id)
	if err != nil {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": "Persona eliminada correctamente"})
}

func (uc *personaUseCase) AddAntecedente(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID no proporcionado"})
		return
	}

	var entry domain.AntecedenteEntry
	if err := c.ShouldBindJSON(&entry); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if entry.Descripcion == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "La descripción es obligatoria"})
		return
	}

	if !utils.IsValidString(entry.Descripcion) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Se presentaron caracteres inválidos"})
		return
	}

	err := uc.repo.AddAntecedente(id, entry)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	persona, err := uc.repo.GetByID(id)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": persona})
}

func (uc *personaUseCase) DeleteAntecedente(c *gin.Context) {
	id := c.Param("id")
	entryID := c.Param("entryId")
	if id == "" || entryID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID no proporcionado"})
		return
	}

	err := uc.repo.DeleteAntecedente(id, entryID)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	persona, err := uc.repo.GetByID(id)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": persona})
}

func (uc *personaUseCase) AddInfoMedica(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID no proporcionado"})
		return
	}

	var entry domain.AntecedenteEntry
	if err := c.ShouldBindJSON(&entry); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if entry.Descripcion == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "La descripción es obligatoria"})
		return
	}

	if !utils.IsValidString(entry.Descripcion) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Se presentaron caracteres inválidos"})
		return
	}

	err := uc.repo.AddInfoMedica(id, entry)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	persona, err := uc.repo.GetByID(id)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": persona})
}

func (uc *personaUseCase) DeleteInfoMedica(c *gin.Context) {
	id := c.Param("id")
	entryID := c.Param("entryId")
	if id == "" || entryID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID no proporcionado"})
		return
	}

	err := uc.repo.DeleteInfoMedica(id, entryID)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	persona, err := uc.repo.GetByID(id)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": persona})
}
