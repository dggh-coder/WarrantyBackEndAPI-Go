package models

import "gorm.io/gorm"

func AutoMigrate(db *gorm.DB) error {
	if err := AutoMigrateMasters(db); err != nil {
		return err
	}

	return db.AutoMigrate(&Asset{}, &AssetSN{}, &Renewal{}, &RenewalItem{})
}
