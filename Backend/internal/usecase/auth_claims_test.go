package usecase

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

func newClaimsContext() (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/", nil)
	return c, w
}

func TestGetAuthenticatedUserID_InvalidClaims_ReturnsUnauthorized(t *testing.T) {
	testCases := []struct {
		name   string
		claims interface{}
		set    bool
	}{
		{name: "missing user", set: false},
		{name: "wrong claims type", claims: map[string]string{"user_id": "123"}, set: true},
		{name: "missing user id", claims: jwt.MapClaims{}, set: true},
		{name: "non string user id", claims: jwt.MapClaims{"user_id": 123}, set: true},
		{name: "empty user id", claims: jwt.MapClaims{"user_id": ""}, set: true},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			c, w := newClaimsContext()
			if tc.set {
				c.Set("user", tc.claims)
			}

			userID, ok := getAuthenticatedUserID(c)

			assert.False(t, ok)
			assert.Empty(t, userID)
			assert.Equal(t, http.StatusUnauthorized, w.Code)
		})
	}
}

func TestGetAuthenticatedUserID_ValidClaims_ReturnsUserID(t *testing.T) {
	c, w := newClaimsContext()
	c.Set("user", jwt.MapClaims{"user_id": "user123"})

	userID, ok := getAuthenticatedUserID(c)

	assert.True(t, ok)
	assert.Equal(t, "user123", userID)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestGetAuthenticatedUserIDAndRole_InvalidRole_ReturnsUnauthorized(t *testing.T) {
	testCases := []struct {
		name   string
		claims jwt.MapClaims
	}{
		{name: "missing role", claims: jwt.MapClaims{"user_id": "user123"}},
		{name: "non string role", claims: jwt.MapClaims{"user_id": "user123", "user_role": 123}},
		{name: "empty role", claims: jwt.MapClaims{"user_id": "user123", "user_role": ""}},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			c, w := newClaimsContext()
			c.Set("user", tc.claims)

			userID, role, ok := getAuthenticatedUserIDAndRole(c)

			assert.False(t, ok)
			assert.Empty(t, userID)
			assert.Empty(t, role)
			assert.Equal(t, http.StatusUnauthorized, w.Code)
		})
	}
}

func TestGetAuthenticatedUserIDAndRole_ValidClaims_ReturnsUserIDAndRole(t *testing.T) {
	c, w := newClaimsContext()
	c.Set("user", jwt.MapClaims{"user_id": "user123", "user_role": "admin"})

	userID, role, ok := getAuthenticatedUserIDAndRole(c)

	assert.True(t, ok)
	assert.Equal(t, "user123", userID)
	assert.Equal(t, "admin", role)
	assert.Equal(t, http.StatusOK, w.Code)
}
