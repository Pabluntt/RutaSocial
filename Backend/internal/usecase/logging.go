package usecase

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func logUseCaseError(c *gin.Context, operation string, status int, err error, attrs ...any) {
	logUseCase(slog.LevelError, c, operation, status, err, attrs...)
}

func logUseCaseWarn(c *gin.Context, operation string, status int, err error, attrs ...any) {
	logUseCase(slog.LevelWarn, c, operation, status, err, attrs...)
}

func logUseCase(level slog.Level, c *gin.Context, operation string, status int, err error, attrs ...any) {
	if err == nil {
		return
	}

	path := ""
	method := ""
	clientIP := ""
	if c != nil {
		path = c.FullPath()
		if path == "" && c.Request != nil && c.Request.URL != nil {
			path = c.Request.URL.Path
		}
		if c.Request != nil {
			method = c.Request.Method
		}
		clientIP = c.ClientIP()
	}

	logAttrs := []any{
		"operation", operation,
		"status", status,
		"status_text", http.StatusText(status),
		"method", method,
		"path", path,
		"client_ip", clientIP,
		"error", err,
	}

	if userID := authenticatedUserIDForLog(c); userID != "" {
		logAttrs = append(logAttrs, "user_id", userID)
	}

	ctx := context.Background()
	if c != nil && c.Request != nil {
		ctx = c.Request.Context()
	}

	logAttrs = append(logAttrs, attrs...)
	slog.Log(ctx, level, "usecase operation failed", logAttrs...)
}

func authenticatedUserIDForLog(c *gin.Context) string {
	if c == nil {
		return ""
	}
	user, exists := c.Get("user")
	if !exists {
		return ""
	}
	claims, ok := user.(jwt.MapClaims)
	if !ok {
		return ""
	}
	userID, ok := claims["user_id"].(string)
	if !ok {
		return ""
	}
	return userID
}
