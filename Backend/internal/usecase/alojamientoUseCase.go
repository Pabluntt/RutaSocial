package usecase

import (
	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/repository"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

type AlojamientoUseCase interface {
	GetAllAlojamientos(c *gin.Context)
	CreateAlojamiento(c *gin.Context)
	DeleteAlojamiento(c *gin.Context)
	UpdateAlojamiento(c *gin.Context)
}

type alojamientoUseCase struct {
	alojamientoRepository repository.AlojamientoRepository
}

func NewAlojamientoUseCase(alojamientoRepository repository.AlojamientoRepository) AlojamientoUseCase {
	return &alojamientoUseCase{
		alojamientoRepository: alojamientoRepository,
	}
}

func (a alojamientoUseCase) GetAllAlojamientos(c *gin.Context) {
	alojamientos, err := a.alojamientoRepository.GetAlojamientos(c.Request.Context())
	if err != nil {
		logUseCaseError(c, "alojamiento.get_all", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al obtener alojamientos"})
		return
	}
	if utils.HasPagination(c) {
		paginated, meta := utils.PaginateSlice(c, alojamientos)
		c.IndentedJSON(http.StatusOK, gin.H{"message": paginated, "pagination": meta})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": alojamientos})
}

func (a alojamientoUseCase) CreateAlojamiento(c *gin.Context) {
	var alojamiento domain.Alojamiento
	if err := c.ShouldBindJSON(&alojamiento); err != nil {
		logUseCaseWarn(c, "alojamiento.create.bind_json", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.IsValidString(alojamiento.Name) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Nombre con caracteres inválidos"})
		return
	}

	err := a.alojamientoRepository.CreateAlojamiento(c.Request.Context(), alojamiento)
	if err != nil {
		logUseCaseError(c, "alojamiento.create", http.StatusBadRequest, err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al crear el alojamiento"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": alojamiento})
}

func (a alojamientoUseCase) DeleteAlojamiento(c *gin.Context) {
	id := c.Param("id")
	err := a.alojamientoRepository.DeleteAlojamiento(c.Request.Context(), id)
	if err != nil {
		logUseCaseWarn(c, "alojamiento.delete", http.StatusBadRequest, err, "alojamiento_id", id)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al eliminar el alojamiento"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": "Alojamiento eliminado correctamente"})
}

func (a alojamientoUseCase) UpdateAlojamiento(c *gin.Context) {
	alojamientoID := c.Param("id")
	if alojamientoID == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "ID de alojamiento no proporcionado"})
		return
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		logUseCaseWarn(c, "alojamiento.update.bind_json", http.StatusBadRequest, err, "alojamiento_id", alojamientoID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !utils.SanitizeStringFields(c, updateData) {
		return
	}

	updateData["_id"] = alojamientoID
	updatedAlojamiento, err := a.alojamientoRepository.UpdateAlojamiento(c.Request.Context(), updateData)
	if err != nil {
		logUseCaseError(c, "alojamiento.update", http.StatusBadRequest, err, "alojamiento_id", alojamientoID)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error al actualizar el alojamiento"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"message": updatedAlojamiento})
}
