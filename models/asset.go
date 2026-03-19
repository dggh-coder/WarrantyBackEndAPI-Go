package models

import "time"

type Asset struct {
	ID               uint       `json:"id" gorm:"primaryKey"`
	ItemNumber       string     `json:"item_number" gorm:"size:100;uniqueIndex;not null"`
	Name             string     `json:"name" gorm:"size:255"`
	Quantity         int        `json:"quantity" gorm:"not null;default:1"`
	UnitID           *uint      `json:"unit_id"`
	CategoryID       *uint      `json:"category_id"`
	LocationID       *uint      `json:"location_id"`
	SupplierID       *uint      `json:"supplier_id"`
	Usage            string     `json:"usage" gorm:"size:255"`
	Description      string     `json:"description" gorm:"type:text"`
	NextBillingDate  time.Time  `json:"next_billing_date" gorm:"type:date;not null"`
	RemindBeforeDays int        `json:"remind_before_days" gorm:"not null;default:90"`
	ExpiryDate       *time.Time `json:"expiry_date" gorm:"type:date"`
	YearlyCost       float64    `json:"yearly_cost"`
	Price            float64    `json:"price"`
	InUse            bool       `json:"in_use" gorm:"not null;default:false"`
	CommissionDate   *time.Time `json:"commission_date" gorm:"type:date"`
	CommissionIP     string     `json:"commission_ip" gorm:"size:45"`
	RecentIP         string     `json:"recent_ip" gorm:"size:45"`
	Status           string     `json:"status" gorm:"size:20;not null;default:active"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`

	Unit     *Unit     `json:"unit,omitempty"`
	Category *Category `json:"category,omitempty"`
	Location *Location `json:"location,omitempty"`
	Supplier *Supplier `json:"supplier,omitempty"`
	SNs      []AssetSN `json:"sns,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

type AssetSN struct {
	ID      uint   `json:"id" gorm:"primaryKey"`
	AssetID uint   `json:"asset_id" gorm:"index;not null"`
	SNValue string `json:"sn_value" gorm:"size:255;uniqueIndex;not null"`
	Remarks string `json:"remarks" gorm:"size:255"`
}
