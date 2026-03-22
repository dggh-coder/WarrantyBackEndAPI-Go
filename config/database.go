package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DatabaseConfig struct {
	Host      string
	Port      string
	User      string
	Password  string
	Name      string
	Charset   string
	ParseTime string
	Loc       string
}

func LoadEnv() {
	if err := godotenv.Load(); err != nil {
		log.Println(".env file not found, using environment variables")
	}
}

func LoadDatabaseConfig() DatabaseConfig {
	return DatabaseConfig{
		Host:      getEnv("DB_HOST", "127.0.0.1"),
		Port:      getEnv("DB_PORT", "3306"),
		User:      getEnv("DB_USER", "root"),
		Password:  os.Getenv("DB_PASSWORD"),
		Name:      getEnv("DB_NAME", "asset_management"),
		Charset:   getEnv("DB_CHARSET", "utf8mb4"),
		ParseTime: getEnv("DB_PARSE_TIME", "True"),
		Loc:       getEnv("DB_LOC", "Local"),
	}
}

func ConnectDatabase(cfg DatabaseConfig) (*gorm.DB, error) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=%s&loc=%s",
		cfg.User,
		cfg.Password,
		cfg.Host,
		cfg.Port,
		cfg.Name,
		cfg.Charset,
		cfg.ParseTime,
		cfg.Loc,
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, fmt.Errorf("connect database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("get sql db: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(50)
	sqlDB.SetConnMaxLifetime(time.Hour)

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return db, nil
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
