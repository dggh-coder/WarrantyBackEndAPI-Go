package models

import "gorm.io/gorm"

type Category struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"size:150;uniqueIndex;not null"`
}

type Location struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"size:150;uniqueIndex;not null"`
}

type Supplier struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"size:150;uniqueIndex;not null"`
}

type Unit struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"size:150;uniqueIndex;not null"`
}

func AutoMigrateMasters(db *gorm.DB) error {
	return db.AutoMigrate(&Category{}, &Location{}, &Supplier{}, &Unit{})
}
