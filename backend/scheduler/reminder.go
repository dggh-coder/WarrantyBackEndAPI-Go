package scheduler

import (
	"log"
	"time"

	"gorm.io/gorm"

	"warrantybackendapi-go/models"
)

type ReminderScheduler struct {
	db       *gorm.DB
	interval time.Duration
}

func NewReminderScheduler(db *gorm.DB, interval time.Duration) *ReminderScheduler {
	return &ReminderScheduler{db: db, interval: interval}
}

func (s *ReminderScheduler) Start() {
	go func() {
		s.runReminderCheck()
		ticker := time.NewTicker(s.interval)
		defer ticker.Stop()

		for range ticker.C {
			s.runReminderCheck()
		}
	}()
}

func (s *ReminderScheduler) runReminderCheck() {
	var assets []models.Asset
	if err := s.db.Find(&assets).Error; err != nil {
		log.Printf("scheduler reminder check failed: %v", err)
		return
	}

	today := time.Now().Truncate(24 * time.Hour)
	for _, asset := range assets {
		daysUntilBilling := int(asset.NextBillingDate.Sub(today).Hours() / 24)
		if daysUntilBilling <= asset.RemindBeforeDays {
			log.Printf("Reminder: Asset %s is due", asset.ItemNumber)
		}
	}
}
