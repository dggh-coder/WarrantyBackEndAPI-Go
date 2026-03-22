package routes

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"warrantybackendapi-go/handlers"
	"warrantybackendapi-go/models"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
	router := gin.Default()
	router.Use(buildCORSConfig())

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	assetHandler := handlers.NewAssetHandler(db)
	renewalHandler := handlers.NewRenewalHandler(db)
	authHandler := handlers.NewAuthHandler()
	categoryHandler := handlers.NewMasterDataHandler[models.Category](db)
	locationHandler := handlers.NewMasterDataHandler[models.Location](db)
	supplierHandler := handlers.NewMasterDataHandler[models.Supplier](db)
	unitHandler := handlers.NewMasterDataHandler[models.Unit](db)

	api := router.Group("/api")
	{
		api.GET("/me", authHandler.GetCurrentUser)

		assets := api.Group("/assets")
		{
			assets.POST("", assetHandler.CreateAsset)
			assets.GET("", assetHandler.ListAssets)
			assets.GET("/:id", assetHandler.GetAsset)
			assets.PUT("/:id", assetHandler.UpdateAsset)
			assets.DELETE("/:id", assetHandler.DeleteAsset)
			assets.POST("/:id/sns", assetHandler.AddSN)
			assets.DELETE("/:id/sns/:snId", assetHandler.RemoveSN)
		}

		registerMasterRoutes(api.Group("/categories"), categoryHandler)
		registerMasterRoutes(api.Group("/locations"), locationHandler)
		registerMasterRoutes(api.Group("/suppliers"), supplierHandler)
		registerMasterRoutes(api.Group("/units"), unitHandler)

		renewals := api.Group("/renewals")
		{
			renewals.POST("", renewalHandler.CreateRenewal)
			renewals.POST("/complete", renewalHandler.CompleteRenewal)
		}
	}

	return router
}

func registerMasterRoutes[T any](group *gin.RouterGroup, handler *handlers.MasterDataHandler[T]) {
	group.POST("", handler.Create)
	group.GET("", handler.List)
	group.GET("/:id", handler.Get)
	group.PUT("/:id", handler.Update)
	group.DELETE("/:id", handler.Delete)
}

func buildCORSConfig() gin.HandlerFunc {
	config := cors.DefaultConfig()
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}

	allowedOrigins := splitAndTrim(strings.TrimSpace(os.Getenv("APP_ALLOWED_ORIGINS")))
	if len(allowedOrigins) == 0 {
		config.AllowAllOrigins = true
	} else {
		config.AllowCredentials = true
		config.AllowOrigins = allowedOrigins
	}

	return cors.New(config)
}

func splitAndTrim(input string) []string {
	parts := strings.Split(input, ",")
	cleaned := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			cleaned = append(cleaned, trimmed)
		}
	}
	return cleaned
}
