package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type ErrorResponse struct {
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

func JSONError(c *gin.Context, status int, message string, details interface{}) {
	c.JSON(status, ErrorResponse{Message: message, Details: details})
}

func JSONMessage(c *gin.Context, status int, message string, data interface{}) {
	c.JSON(status, gin.H{"message": message, "data": data})
}

func abortValidationError(c *gin.Context, err error) {
	JSONError(c, http.StatusBadRequest, "invalid request payload", err.Error())
}
