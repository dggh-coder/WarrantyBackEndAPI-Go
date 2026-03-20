# WarrantyBackEndAPI-Go Monorepo

此 repository 已整理為同 repo 的 monorepo 結構，分成前後端兩個區塊：

- `backend/`：Go + Gin + GORM + MariaDB 的 API 後端
- `frontend/`：前端應用程式預留位置

## 建議使用方式

### 啟動 backend
```bash
cd backend
go run main.go
```

### 執行 backend 測試
```bash
cd backend
go test ./...
```

### frontend 規劃
目前 `frontend/` 先保留為前端專案入口位置，可於之後放入 React / Vue / Next.js 專案。
