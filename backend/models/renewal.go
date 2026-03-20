package models

import "time"

type Renewal struct {
	ID        uint          `json:"id" gorm:"primaryKey"`
	RenewalNo string        `json:"renewal_no" gorm:"size:100;uniqueIndex;not null"`
	Status    string        `json:"status" gorm:"size:20;not null;default:pending"`
	CreatedAt time.Time     `json:"created_at"`
	UpdatedAt time.Time     `json:"updated_at"`
	Items     []RenewalItem `json:"items,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

type RenewalItem struct {
	ID            uint       `json:"id" gorm:"primaryKey"`
	RenewalID     uint       `json:"renewal_id" gorm:"index;not null"`
	AssetID       uint       `json:"asset_id" gorm:"index;not null"`
	NewSupplierID *uint      `json:"new_supplier_id"`
	NewExpiryDate *time.Time `json:"new_expiry_date" gorm:"type:date"`
	NewCost       float64    `json:"new_cost"`

	Asset       *Asset    `json:"asset,omitempty"`
	NewSupplier *Supplier `json:"new_supplier,omitempty"`
}
