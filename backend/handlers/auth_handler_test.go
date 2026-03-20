package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestGetCurrentUserDefaults(t *testing.T) {
	gin.SetMode(gin.TestMode)
	t.Setenv("APP_AUTH_USERNAME", "")
	t.Setenv("APP_AUTH_ROLE", "")

	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	request := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	ctx.Request = request

	NewAuthHandler().GetCurrentUser(ctx)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	var response struct {
		Message string      `json:"message"`
		Data    UserProfile `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("unmarshal response: %v", err)
	}

	if response.Data.Username != "local-admin" {
		t.Fatalf("expected default username local-admin, got %q", response.Data.Username)
	}
	if response.Data.Role != "write" {
		t.Fatalf("expected default role write, got %q", response.Data.Role)
	}
}

func TestGetCurrentUserUsesEnv(t *testing.T) {
	gin.SetMode(gin.TestMode)
	t.Setenv("APP_AUTH_USERNAME", "qa-user")
	t.Setenv("APP_AUTH_ROLE", "read")

	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	request := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	ctx.Request = request

	NewAuthHandler().GetCurrentUser(ctx)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	var response struct {
		Data UserProfile `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("unmarshal response: %v", err)
	}

	if response.Data.Username != "qa-user" {
		t.Fatalf("expected env username qa-user, got %q", response.Data.Username)
	}
	if response.Data.Role != "read" {
		t.Fatalf("expected env role read, got %q", response.Data.Role)
	}
}

func TestGetCurrentUserRejectsInvalidRole(t *testing.T) {
	gin.SetMode(gin.TestMode)
	t.Setenv("APP_AUTH_ROLE", "admin")

	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	request := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	ctx.Request = request

	NewAuthHandler().GetCurrentUser(ctx)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", http.StatusInternalServerError, recorder.Code)
	}
}
