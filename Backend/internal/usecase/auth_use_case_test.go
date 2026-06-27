package usecase

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func performRequest(method, path, body string, handler gin.HandlerFunc) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = httptest.NewRequest(method, path, strings.NewReader(body))
	ctx.Request.Header.Set("Content-Type", "application/json")
	handler(ctx)
	return w
}

func performRequestWithParams(method, path, body string, params []gin.Param, handler gin.HandlerFunc) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = httptest.NewRequest(method, path, strings.NewReader(body))
	ctx.Request.Header.Set("Content-Type", "application/json")
	ctx.Params = params
	handler(ctx)
	return w
}

func TestLogin_ValidCredentials_ReturnsToken(t *testing.T) {
	mockRepo := new(MockAuthRepository)
	mockRepo.On("Login", mock.Anything, "test@test.com", "password123").
		Return("jwt_token_value", nil)

	uc := NewAuthUseCase(mockRepo)
	w := performRequest("POST", "/login", `{"email":"test@test.com","password":"password123"}`, uc.Login)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]string
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Equal(t, "jwt_token_value", resp["token"])
	mockRepo.AssertExpectations(t)
}

func TestLogin_InvalidEmail_Returns400(t *testing.T) {
	mockRepo := new(MockAuthRepository)
	uc := NewAuthUseCase(mockRepo)

	w := performRequest("POST", "/login", `{"email":"email-invalido","password":"password123"}`, uc.Login)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	mockRepo.AssertNotCalled(t, "Login")
}

func TestLogin_InvalidPassword_Returns400(t *testing.T) {
	mockRepo := new(MockAuthRepository)
	uc := NewAuthUseCase(mockRepo)

	w := performRequest("POST", "/login", `{"email":"test@test.com","password":""}`, uc.Login)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	mockRepo.AssertNotCalled(t, "Login")
}

func TestLogin_WrongCredentials_Returns401(t *testing.T) {
	mockRepo := new(MockAuthRepository)
	mockRepo.On("Login", mock.Anything, "wrong@test.com", "wrongpass").
		Return("", assert.AnError)

	uc := NewAuthUseCase(mockRepo)
	w := performRequest("POST", "/login", `{"email":"wrong@test.com","password":"wrongpass"}`, uc.Login)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
