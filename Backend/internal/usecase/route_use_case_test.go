package usecase

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func setJWTUser(c *gin.Context, userID, role string) {
	claims := jwt.MapClaims{
		"user_id":   userID,
		"user_role": role,
	}
	c.Set("user", claims)
}

func TestFinishRoute_UserIsLeader_FinishesSuccessfully(t *testing.T) {
	leaderID := "507f1f77bcf86cd799439011"
	mockRepo := new(MockRouteRepository)
	mockRepo.On("FinishRoute", mock.Anything, "route123", leaderID, false).
		Return(nil)

	mockUserRepo := new(MockUserRepository)
	uc := NewRouteUseCase(mockRepo, mockUserRepo)
	w := performRequestWithParams("PATCH", "/route/route123", ``, []gin.Param{{Key: "id", Value: "route123"}}, func(c *gin.Context) {
		setJWTUser(c, leaderID, "voluntario")
		uc.FinishRoute(c)
	})

	assert.Equal(t, http.StatusOK, w.Code)
	var resp map[string]string
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Equal(t, "Ruta finalizada correctamente", resp["message"])
	mockRepo.AssertExpectations(t)
}

func TestFinishRoute_UserIsNotLeader_ReturnsForbidden(t *testing.T) {
	otherUserID := "507f1f77bcf86cd799439022"

	mockRepo := new(MockRouteRepository)
	mockRepo.On("FinishRoute", mock.Anything, "route123", otherUserID, false).
		Return(assert.AnError)

	mockUserRepo := new(MockUserRepository)
	uc := NewRouteUseCase(mockRepo, mockUserRepo)
	w := performRequestWithParams("PATCH", "/route/route123", ``, []gin.Param{{Key: "id", Value: "route123"}}, func(c *gin.Context) {
		setJWTUser(c, otherUserID, "voluntario")
		uc.FinishRoute(c)
	})

	assert.Equal(t, http.StatusForbidden, w.Code)
	mockRepo.AssertExpectations(t)
}

func TestFinishRoute_RouteNotFound_ReturnsBadRequest(t *testing.T) {
	mockRepo := new(MockRouteRepository)
	mockRepo.On("FinishRoute", mock.Anything, "route_inexistente", "507f1f77bcf86cd799439011", false).
		Return(assert.AnError)

	mockUserRepo := new(MockUserRepository)
	uc := NewRouteUseCase(mockRepo, mockUserRepo)
	w := performRequestWithParams("PATCH", "/route/route_inexistente", ``, []gin.Param{{Key: "id", Value: "route_inexistente"}}, func(c *gin.Context) {
		setJWTUser(c, "507f1f77bcf86cd799439011", "voluntario")
		uc.FinishRoute(c)
	})

	assert.Equal(t, http.StatusForbidden, w.Code)
	mockRepo.AssertExpectations(t)
}

func TestFinishRoute_MissingAuthenticatedUser_ReturnsUnauthorized(t *testing.T) {
	mockRepo := new(MockRouteRepository)

	mockUserRepo := new(MockUserRepository)
	uc := NewRouteUseCase(mockRepo, mockUserRepo)
	w := performRequestWithParams("PATCH", "/route/route123", ``, []gin.Param{{Key: "id", Value: "route123"}}, func(c *gin.Context) {
		uc.FinishRoute(c)
	})

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	mockRepo.AssertNotCalled(t, "FindByID")
	mockRepo.AssertNotCalled(t, "FinishRoute")
}
