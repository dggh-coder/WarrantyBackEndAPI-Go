package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"warrantybackendapi-go/models"
)

type AssetHandler struct {
	db *gorm.DB
}

type assetSNInput struct {
	SNValue string `json:"sn_value" binding:"required,max=255"`
	Remarks string `json:"remarks" binding:"max=255"`
}

type AssetRequest struct {
	ItemNumber       string         `json:"item_number" binding:"required,max=100"`
	Name             string         `json:"name" binding:"max=255"`
	Quantity         int            `json:"quantity" binding:"gte=0"`
	UnitID           *uint          `json:"unit_id"`
	CategoryID       *uint          `json:"category_id"`
	LocationID       *uint          `json:"location_id"`
	SupplierID       *uint          `json:"supplier_id"`
	Usage            string         `json:"usage" binding:"max=255"`
	Description      string         `json:"description"`
	NextBillingDate  string         `json:"next_billing_date" binding:"required"`
	RemindBeforeDays int            `json:"remind_before_days" binding:"gte=0"`
	ExpiryDate       *string        `json:"expiry_date"`
	YearlyCost       float64        `json:"yearly_cost"`
	Price            float64        `json:"price"`
	InUse            bool           `json:"in_use"`
	CommissionDate   *string        `json:"commission_date"`
	CommissionIP     string         `json:"commission_ip" binding:"max=45"`
	RecentIP         string         `json:"recent_ip" binding:"max=45"`
	Status           string         `json:"status" binding:"omitempty,oneof=active renewing"`
	SNs              []assetSNInput `json:"sns"`
}

type AddSNRequest struct {
	SNValue string `json:"sn_value" binding:"required,max=255"`
	Remarks string `json:"remarks" binding:"max=255"`
}

func NewAssetHandler(db *gorm.DB) *AssetHandler {
	return &AssetHandler{db: db}
}

func (h *AssetHandler) CreateAsset(c *gin.Context) {
	var req AssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		abortValidationError(c, err)
		return
	}

	asset, err := buildAssetModel(req)
	if err != nil {
		JSONError(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	if asset.Quantity == 0 {
		asset.Quantity = 1
	}
	if asset.RemindBeforeDays == 0 {
		asset.RemindBeforeDays = 90
	}
	if asset.Status == "" {
		asset.Status = "active"
	}

	asset.SNs = make([]models.AssetSN, 0, len(req.SNs))
	for _, sn := range req.SNs {
		asset.SNs = append(asset.SNs, models.AssetSN{SNValue: sn.SNValue, Remarks: sn.Remarks})
	}

	if err := h.db.Create(&asset).Error; err != nil {
		JSONError(c, http.StatusBadRequest, "failed to create asset", err.Error())
		return
	}

	if err := h.db.Preload("SNs").Preload("Category").Preload("Location").Preload("Supplier").Preload("Unit").First(&asset, asset.ID).Error; err != nil {
		JSONError(c, http.StatusInternalServerError, "failed to load created asset", err.Error())
		return
	}

	JSONMessage(c, http.StatusCreated, "asset created", asset)
}

func (h *AssetHandler) ListAssets(c *gin.Context) {
	var assets []models.Asset
	if err := h.db.Preload("Category").Preload("Supplier").Preload("Location").Preload("Unit").Preload("SNs").Find(&assets).Error; err != nil {
		JSONError(c, http.StatusInternalServerError, "failed to list assets", err.Error())
		return
	}

	JSONMessage(c, http.StatusOK, "assets retrieved", assets)
}

func (h *AssetHandler) GetAsset(c *gin.Context) {
	id, ok := parseUintParam(c, "id")
	if !ok {
		return
	}

	var asset models.Asset
	if err := h.db.Preload("Category").Preload("Supplier").Preload("Location").Preload("Unit").Preload("SNs").First(&asset, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			JSONError(c, http.StatusNotFound, "asset not found", nil)
			return
		}
		JSONError(c, http.StatusInternalServerError, "failed to retrieve asset", err.Error())
		return
	}

	JSONMessage(c, http.StatusOK, "asset retrieved", asset)
}

func (h *AssetHandler) UpdateAsset(c *gin.Context) {
	id, ok := parseUintParam(c, "id")
	if !ok {
		return
	}

	var req AssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		abortValidationError(c, err)
		return
	}

	var asset models.Asset
	if err := h.db.Preload("SNs").First(&asset, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			JSONError(c, http.StatusNotFound, "asset not found", nil)
			return
		}
		JSONError(c, http.StatusInternalServerError, "failed to load asset", err.Error())
		return
	}

	updated, err := buildAssetModel(req)
	if err != nil {
		JSONError(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	asset.ItemNumber = updated.ItemNumber
	asset.Name = updated.Name
	asset.Quantity = updated.Quantity
	if asset.Quantity == 0 {
		asset.Quantity = 1
	}
	asset.UnitID = updated.UnitID
	asset.CategoryID = updated.CategoryID
	asset.LocationID = updated.LocationID
	asset.SupplierID = updated.SupplierID
	asset.Usage = updated.Usage
	asset.Description = updated.Description
	asset.NextBillingDate = updated.NextBillingDate
	asset.RemindBeforeDays = updated.RemindBeforeDays
	if asset.RemindBeforeDays == 0 {
		asset.RemindBeforeDays = 90
	}
	asset.ExpiryDate = updated.ExpiryDate
	asset.YearlyCost = updated.YearlyCost
	asset.Price = updated.Price
	asset.InUse = updated.InUse
	asset.CommissionDate = updated.CommissionDate
	asset.CommissionIP = updated.CommissionIP
	asset.RecentIP = updated.RecentIP
	if updated.Status == "" {
		asset.Status = "active"
	} else {
		asset.Status = updated.Status
	}

	if err := h.db.Session(&gorm.Session{FullSaveAssociations: true}).Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&asset).Error; err != nil {
			return err
		}

		if req.SNs != nil {
			if err := tx.Where("asset_id = ?", asset.ID).Delete(&models.AssetSN{}).Error; err != nil {
				return err
			}
			for _, sn := range req.SNs {
				if err := tx.Create(&models.AssetSN{AssetID: asset.ID, SNValue: sn.SNValue, Remarks: sn.Remarks}).Error; err != nil {
					return err
				}
			}
		}
		return nil
	}); err != nil {
		JSONError(c, http.StatusBadRequest, "failed to update asset", err.Error())
		return
	}

	if err := h.db.Preload("Category").Preload("Supplier").Preload("Location").Preload("Unit").Preload("SNs").First(&asset, id).Error; err != nil {
		JSONError(c, http.StatusInternalServerError, "failed to load updated asset", err.Error())
		return
	}

	JSONMessage(c, http.StatusOK, "asset updated", asset)
}

func (h *AssetHandler) DeleteAsset(c *gin.Context) {
	id, ok := parseUintParam(c, "id")
	if !ok {
		return
	}

	result := h.db.Delete(&models.Asset{}, id)
	if result.Error != nil {
		JSONError(c, http.StatusInternalServerError, "failed to delete asset", result.Error.Error())
		return
	}
	if result.RowsAffected == 0 {
		JSONError(c, http.StatusNotFound, "asset not found", nil)
		return
	}

	JSONMessage(c, http.StatusOK, "asset deleted", nil)
}

func (h *AssetHandler) AddSN(c *gin.Context) {
	assetID, ok := parseUintParam(c, "id")
	if !ok {
		return
	}

	var req AddSNRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		abortValidationError(c, err)
		return
	}

	var asset models.Asset
	if err := h.db.First(&asset, assetID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			JSONError(c, http.StatusNotFound, "asset not found", nil)
			return
		}
		JSONError(c, http.StatusInternalServerError, "failed to load asset", err.Error())
		return
	}

	sn := models.AssetSN{AssetID: assetID, SNValue: req.SNValue, Remarks: req.Remarks}
	if err := h.db.Create(&sn).Error; err != nil {
		JSONError(c, http.StatusBadRequest, "failed to add sn", err.Error())
		return
	}

	JSONMessage(c, http.StatusCreated, "sn added", sn)
}

func (h *AssetHandler) RemoveSN(c *gin.Context) {
	assetID, ok := parseUintParam(c, "id")
	if !ok {
		return
	}
	snID, ok := parseUintParam(c, "snId")
	if !ok {
		return
	}

	result := h.db.Where("asset_id = ?", assetID).Delete(&models.AssetSN{}, snID)
	if result.Error != nil {
		JSONError(c, http.StatusInternalServerError, "failed to remove sn", result.Error.Error())
		return
	}
	if result.RowsAffected == 0 {
		JSONError(c, http.StatusNotFound, "sn not found", nil)
		return
	}

	JSONMessage(c, http.StatusOK, "sn removed", nil)
}

func buildAssetModel(req AssetRequest) (models.Asset, error) {
	nextBillingDate, err := parseDate(req.NextBillingDate)
	if err != nil {
		return models.Asset{}, errors.New("next_billing_date must be in YYYY-MM-DD format")
	}

	asset := models.Asset{
		ItemNumber:       req.ItemNumber,
		Name:             req.Name,
		Quantity:         req.Quantity,
		UnitID:           req.UnitID,
		CategoryID:       req.CategoryID,
		LocationID:       req.LocationID,
		SupplierID:       req.SupplierID,
		Usage:            req.Usage,
		Description:      req.Description,
		NextBillingDate:  nextBillingDate,
		RemindBeforeDays: req.RemindBeforeDays,
		YearlyCost:       req.YearlyCost,
		Price:            req.Price,
		InUse:            req.InUse,
		CommissionIP:     req.CommissionIP,
		RecentIP:         req.RecentIP,
		Status:           req.Status,
	}

	if req.ExpiryDate != nil && *req.ExpiryDate != "" {
		date, err := parseDate(*req.ExpiryDate)
		if err != nil {
			return models.Asset{}, errors.New("expiry_date must be in YYYY-MM-DD format")
		}
		asset.ExpiryDate = &date
	}

	if req.CommissionDate != nil && *req.CommissionDate != "" {
		date, err := parseDate(*req.CommissionDate)
		if err != nil {
			return models.Asset{}, errors.New("commission_date must be in YYYY-MM-DD format")
		}
		asset.CommissionDate = &date
	}

	return asset, nil
}

func parseUintParam(c *gin.Context, key string) (uint, bool) {
	id, err := strconv.ParseUint(c.Param(key), 10, 64)
	if err != nil {
		JSONError(c, http.StatusBadRequest, "invalid id parameter", key)
		return 0, false
	}
	return uint(id), true
}

func parseDate(value string) (time.Time, error) {
	return time.Parse("2006-01-02", value)
}
