package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"warrantybackendapi-go/handlers"
	"warrantybackendapi-go/models"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	assetHandler := handlers.NewAssetHandler(db)
	renewalHandler := handlers.NewRenewalHandler(db)
	categoryHandler := handlers.NewMasterDataHandler[models.Category](db)
	locationHandler := handlers.NewMasterDataHandler[models.Location](db)
	supplierHandler := handlers.NewMasterDataHandler[models.Supplier](db)
	unitHandler := handlers.NewMasterDataHandler[models.Unit](db)

	api := router.Group("/api")
	{
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
