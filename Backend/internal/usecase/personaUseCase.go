package usecase

import (
	"net/http"

	"github.com/Pabluntt/RutaSocial/Backend/internal/domain"
	"github.com/Pabluntt/RutaSocial/Backend/internal/dto"
	"github.com/Pabluntt/RutaSocial/Backend/internal/repository"
	"github.com/Pabluntt/RutaSocial/Backend/internal/utils"
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
	personas, err := uc.repo.GetAll(c.Request.Context())
	if err != nil {
		logUseCaseError(c, "persona.get_all", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener personas"})
		return
	}
	response := dto.MapPersonasToSummaryResponse(personas)
	if utils.HasPagination(c) {
		paginated, meta := utils.PaginateSlice(c, response)
		c.IndentedJSON(http.StatusOK, gin.H{"message": paginated, "pagination": meta})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": response})
}

func (uc *personaUseCase) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID no proporcionado"})
		return
	}

	persona, err := uc.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		logUseCaseWarn(c, "persona.get_by_id", http.StatusNotFound, err, "persona_id", id)
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

	personas, err := uc.repo.Search(c.Request.Context(), query)
	if err != nil {
		logUseCaseError(c, "persona.search", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al buscar personas"})
		return
	}
	response := dto.MapPersonasToSummaryResponse(personas)
	if utils.HasPagination(c) {
		paginated, meta := utils.PaginateSlice(c, response)
		c.IndentedJSON(http.StatusOK, gin.H{"message": paginated, "pagination": meta})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": response})
}

func (uc *personaUseCase) Create(c *gin.Context) {
	var persona domain.Persona
	if err := c.ShouldBindJSON(&persona); err != nil {
		logUseCaseWarn(c, "persona.create.bind_json", http.StatusBadRequest, err)
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
		existing, err := uc.repo.GetByRut(c.Request.Context(), persona.Rut)
		if err != nil {
			logUseCaseError(c, "persona.create.check_rut", http.StatusBadRequest, err)
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al verificar RUT"})
			return
		}
		if existing.ID.Hex() != "" {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Ya existe una persona con ese RUT", "persona": existing})
			return
		}
	}

	created, err := uc.repo.Create(c.Request.Context(), persona)
	if err != nil {
		logUseCaseError(c, "persona.create", http.StatusBadRequest, err)
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
		logUseCaseWarn(c, "persona.update.bind_json", http.StatusBadRequest, err, "persona_id", id)
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

	updated, err := uc.repo.Update(c.Request.Context(), id, updateData)
	if err != nil {
		logUseCaseError(c, "persona.update", http.StatusBadRequest, err, "persona_id", id)
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

	err := uc.repo.Delete(c.Request.Context(), id)
	if err != nil {
		logUseCaseWarn(c, "persona.delete", http.StatusNotFound, err, "persona_id", id)
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
		logUseCaseWarn(c, "persona.add_antecedente.bind_json", http.StatusBadRequest, err, "persona_id", id)
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

	err := uc.repo.AddAntecedente(c.Request.Context(), id, entry)
	if err != nil {
		logUseCaseError(c, "persona.add_antecedente", http.StatusBadRequest, err, "persona_id", id)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	persona, err := uc.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		logUseCaseError(c, "persona.add_antecedente.reload", http.StatusBadRequest, err, "persona_id", id)
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

	err := uc.repo.DeleteAntecedente(c.Request.Context(), id, entryID)
	if err != nil {
		logUseCaseError(c, "persona.delete_antecedente", http.StatusBadRequest, err, "persona_id", id, "entry_id", entryID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	persona, err := uc.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		logUseCaseError(c, "persona.delete_antecedente.reload", http.StatusBadRequest, err, "persona_id", id)
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
		logUseCaseWarn(c, "persona.add_info_medica.bind_json", http.StatusBadRequest, err, "persona_id", id)
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

	err := uc.repo.AddInfoMedica(c.Request.Context(), id, entry)
	if err != nil {
		logUseCaseError(c, "persona.add_info_medica", http.StatusBadRequest, err, "persona_id", id)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	persona, err := uc.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		logUseCaseError(c, "persona.add_info_medica.reload", http.StatusBadRequest, err, "persona_id", id)
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

	err := uc.repo.DeleteInfoMedica(c.Request.Context(), id, entryID)
	if err != nil {
		logUseCaseError(c, "persona.delete_info_medica", http.StatusBadRequest, err, "persona_id", id, "entry_id", entryID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	persona, err := uc.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		logUseCaseError(c, "persona.delete_info_medica.reload", http.StatusBadRequest, err, "persona_id", id)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": persona})
}
