package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"warrantybackendapi-go/models"
)

type RenewalHandler struct {
	db *gorm.DB
}

type CreateRenewalRequest struct {
	RenewalNo string `json:"renewal_no" binding:"required,max=100"`
	AssetIDs  []uint `json:"asset_ids" binding:"required,min=1"`
}

type CompleteRenewalRequest struct {
	RenewalID uint                  `json:"renewal_id" binding:"required"`
	Items     []CompleteRenewalItem `json:"items" binding:"required,min=1"`
}

type CompleteRenewalItem struct {
	AssetID       uint    `json:"asset_id" binding:"required"`
	NewSupplierID *uint   `json:"new_supplier_id"`
	NewCost       float64 `json:"new_cost"`
	NewDate       string  `json:"new_date" binding:"required"`
}

func NewRenewalHandler(db *gorm.DB) *RenewalHandler {
	return &RenewalHandler{db: db}
}

func (h *RenewalHandler) CreateRenewal(c *gin.Context) {
	var req CreateRenewalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		abortValidationError(c, err)
		return
	}

	uniqueAssetIDs := make([]uint, 0, len(req.AssetIDs))
	seen := make(map[uint]struct{}, len(req.AssetIDs))
	for _, assetID := range req.AssetIDs {
		if _, exists := seen[assetID]; exists {
			JSONError(c, http.StatusBadRequest, "asset_ids contains duplicate values", nil)
			return
		}
		seen[assetID] = struct{}{}
		uniqueAssetIDs = append(uniqueAssetIDs, assetID)
	}

	renewal := models.Renewal{RenewalNo: req.RenewalNo, Status: "pending"}

	if err := h.db.Transaction(func(tx *gorm.DB) error {
		var assets []models.Asset
		if err := tx.Where("id IN ?", uniqueAssetIDs).Find(&assets).Error; err != nil {
			return err
		}
		if len(assets) != len(uniqueAssetIDs) {
			return fmt.Errorf("one or more assets were not found")
		}

		if err := tx.Create(&renewal).Error; err != nil {
			return err
		}

		for _, asset := range assets {
			if err := tx.Model(&models.Asset{}).Where("id = ?", asset.ID).Update("status", "renewing").Error; err != nil {
				return err
			}
			item := models.RenewalItem{RenewalID: renewal.ID, AssetID: asset.ID}
			if err := tx.Create(&item).Error; err != nil {
				return err
			}
		}

		return nil
	}); err != nil {
		JSONError(c, http.StatusBadRequest, "failed to create renewal", err.Error())
		return
	}

	if err := h.db.Preload("Items").First(&renewal, renewal.ID).Error; err != nil {
		JSONError(c, http.StatusInternalServerError, "failed to load renewal", err.Error())
		return
	}

	JSONMessage(c, http.StatusCreated, "renewal created", renewal)
}

func (h *RenewalHandler) CompleteRenewal(c *gin.Context) {
	var req CompleteRenewalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		abortValidationError(c, err)
		return
	}

	if err := h.db.Transaction(func(tx *gorm.DB) error {
		var renewal models.Renewal
		if err := tx.Preload("Items").First(&renewal, req.RenewalID).Error; err != nil {
			return err
		}
		if renewal.Status == "completed" {
			return fmt.Errorf("renewal already completed")
		}

		for _, input := range req.Items {
			newDate, err := time.Parse("2006-01-02", input.NewDate)
			if err != nil {
				return fmt.Errorf("new_date for asset %d must be in YYYY-MM-DD format", input.AssetID)
			}

			var renewalItem models.RenewalItem
			if err := tx.Where("renewal_id = ? AND asset_id = ?", req.RenewalID, input.AssetID).First(&renewalItem).Error; err != nil {
				return fmt.Errorf("renewal item for asset %d not found", input.AssetID)
			}

			updates := map[string]interface{}{
				"yearly_cost":       input.NewCost,
				"expiry_date":       newDate,
				"next_billing_date": newDate,
				"status":            "active",
			}
			if input.NewSupplierID != nil {
				updates["supplier_id"] = *input.NewSupplierID
			}

			if err := tx.Model(&models.Asset{}).Where("id = ?", input.AssetID).Updates(updates).Error; err != nil {
				return err
			}

			itemUpdates := map[string]interface{}{
				"new_supplier_id": input.NewSupplierID,
				"new_expiry_date": newDate,
				"new_cost":        input.NewCost,
			}
			if err := tx.Model(&renewalItem).Updates(itemUpdates).Error; err != nil {
				return err
			}
		}

		if err := tx.Model(&models.Renewal{}).Where("id = ?", req.RenewalID).Update("status", "completed").Error; err != nil {
			return err
		}

		return nil
	}); err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
		}
		JSONError(c, status, "failed to complete renewal", err.Error())
		return
	}

	var renewal models.Renewal
	if err := h.db.Preload("Items").First(&renewal, req.RenewalID).Error; err != nil {
		JSONError(c, http.StatusInternalServerError, "failed to load completed renewal", err.Error())
		return
	}

	JSONMessage(c, http.StatusOK, "renewal completed", renewal)
}
