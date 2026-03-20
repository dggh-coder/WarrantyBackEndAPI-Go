package handlers

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type UserProfile struct {
	Username string `json:"username"`
	Role     string `json:"role"`
}

type AuthHandler struct{}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	profile := UserProfile{
		Username: getEnvOrDefault("APP_AUTH_USERNAME", "local-admin"),
		Role:     getEnvOrDefault("APP_AUTH_ROLE", "write"),
	}

	if profile.Role != "read" && profile.Role != "write" {
		JSONError(c, http.StatusInternalServerError, "invalid APP_AUTH_ROLE; expected read or write", nil)
		return
	}

	JSONMessage(c, http.StatusOK, "current user retrieved", profile)
}

func getEnvOrDefault(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
