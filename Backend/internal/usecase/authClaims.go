package usecase

import (
	"net/http"

	"github.com/Pabluntt/RutaSocial/Backend/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func getAuthenticatedUserID(c *gin.Context) (string, bool) {
	claims, exists := c.Get("user")
	if !exists {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return "", false
	}

	userClaims, ok := claims.(jwt.MapClaims)
	if !ok {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return "", false
	}

	userID, ok := userClaims["user_id"].(string)
	if !ok || userID == "" {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return "", false
	}

	return userID, true
}

func getAuthenticatedUserIDAndRole(c *gin.Context) (string, string, bool) {
	claims, exists := c.Get("user")
	if !exists {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return "", "", false
	}

	userClaims, ok := claims.(jwt.MapClaims)
	if !ok {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return "", "", false
	}

	userID, ok := userClaims["user_id"].(string)
	if !ok || userID == "" {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return "", "", false
	}

	userRole, ok := userClaims["user_role"].(string)
	if !ok || userRole == "" {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return "", "", false
	}

	return userID, userRole, true
}

func requireSelfOrAdmin(c *gin.Context, targetUserID string) bool {
	userID, userRole, ok := getAuthenticatedUserIDAndRole(c)
	if !ok {
		return false
	}
	if userRole == domain.RoleAdmin || userID == targetUserID {
		return true
	}
	c.IndentedJSON(http.StatusForbidden, gin.H{"error": "No tienes permiso para acceder a este recurso"})
	return false
}
