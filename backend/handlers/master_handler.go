package handlers

import (
	"errors"
	"net/http"
	"reflect"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type MasterDataHandler[T any] struct {
	db *gorm.DB
}

type masterRequest struct {
	Name string `json:"name" binding:"required,max=150"`
}

func NewMasterDataHandler[T any](db *gorm.DB) *MasterDataHandler[T] {
	return &MasterDataHandler[T]{db: db}
}

func (h *MasterDataHandler[T]) Create(c *gin.Context) {
	var req masterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		abortValidationError(c, err)
		return
	}

	entity := new(T)
	value := reflect.ValueOf(entity).Elem()
	nameField := value.FieldByName("Name")
	if !nameField.IsValid() || !nameField.CanSet() || nameField.Kind() != reflect.String {
		JSONError(c, http.StatusInternalServerError, "master data model missing settable Name field", nil)
		return
	}
	nameField.SetString(req.Name)

	if err := h.db.Create(entity).Error; err != nil {
		JSONError(c, http.StatusBadRequest, "failed to create master data", err.Error())
		return
	}

	JSONMessage(c, http.StatusCreated, "master data created", entity)
}

func (h *MasterDataHandler[T]) List(c *gin.Context) {
	var items []T
	if err := h.db.Find(&items).Error; err != nil {
		JSONError(c, http.StatusInternalServerError, "failed to list master data", err.Error())
		return
	}
	JSONMessage(c, http.StatusOK, "master data retrieved", items)
}

func (h *MasterDataHandler[T]) Get(c *gin.Context) {
	id, ok := parseUintParam(c, "id")
	if !ok {
		return
	}

	var item T
	if err := h.db.First(&item, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			JSONError(c, http.StatusNotFound, "master data not found", nil)
			return
		}
		JSONError(c, http.StatusInternalServerError, "failed to retrieve master data", err.Error())
		return
	}
	JSONMessage(c, http.StatusOK, "master data retrieved", item)
}

func (h *MasterDataHandler[T]) Update(c *gin.Context) {
	id, ok := parseUintParam(c, "id")
	if !ok {
		return
	}

	var req masterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		abortValidationError(c, err)
		return
	}

	var item T
	if err := h.db.First(&item, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			JSONError(c, http.StatusNotFound, "master data not found", nil)
			return
		}
		JSONError(c, http.StatusInternalServerError, "failed to load master data", err.Error())
		return
	}

	if err := h.db.Model(&item).Update("name", req.Name).Error; err != nil {
		JSONError(c, http.StatusBadRequest, "failed to update master data", err.Error())
		return
	}

	if err := h.db.First(&item, id).Error; err != nil {
		JSONError(c, http.StatusInternalServerError, "failed to reload master data", err.Error())
		return
	}

	JSONMessage(c, http.StatusOK, "master data updated", item)
}

func (h *MasterDataHandler[T]) Delete(c *gin.Context) {
	id, ok := parseUintParam(c, "id")
	if !ok {
		return
	}

	result := h.db.Delete(new(T), id)
	if result.Error != nil {
		JSONError(c, http.StatusInternalServerError, "failed to delete master data", result.Error.Error())
		return
	}
	if result.RowsAffected == 0 {
		JSONError(c, http.StatusNotFound, "master data not found", nil)
		return
	}

	JSONMessage(c, http.StatusOK, "master data deleted", nil)
}
