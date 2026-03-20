# WarrantyBackEndAPI-Go Monorepo 結構說明

本文件說明目前專案已改成「前後端同 repo」的 monorepo 架構，方便後續同時管理 API backend 與 frontend。

---

## 一、目前建議的 repository 分工

```text
/
├─ backend/   -> Go API 後端
├─ frontend/  -> 前端專案預留位置
├─ README.md
├─ PROJECT_STRUCTURE.md
├─ go.work
└─ .gitignore
```

簡單理解：

- `backend/`：放現在已完成的 Go 後端
- `frontend/`：放未來要新增的前端專案
- `go.work`：讓 root 可以管理同 repo 內的 Go workspace

---

## 二、為什麼改成同 repo

這次調整的目的是：

1. 保留同 repo 開發的便利性
2. 避免前端與後端檔案混在同一層造成混亂
3. 讓未來前端能獨立用 npm / pnpm / yarn 管理
4. 讓後端仍維持原本 Go module 結構

也就是說：

- 前端與後端仍在同一個 repository
- 但會以 `backend/` 與 `frontend/` 做清楚分拆

---

## 三、根目錄檔案說明

### `README.md`
功能：提供整個 monorepo 的快速使用方式。

用途：

- 說明這個 repo 已分成 backend / frontend
- 提供 backend 啟動方式
- 提供 backend 測試方式
- 提醒 frontend 尚未初始化框架

### `PROJECT_STRUCTURE.md`
功能：描述整個 monorepo 的結構與每個資料夾的職責。

### `go.work`
功能：Go workspace 設定檔。

用途：

- 讓 root 層可以識別 `backend/` 這個 Go module
- 方便未來同 repo 中若有多個 Go module 仍可集中管理

### `.gitignore`
功能：忽略不應提交的檔案。

目前主要忽略：

- `backend/.env`
- `frontend/node_modules/`
- `frontend/dist/`
- 常見前端建置產物

---

## 四、`/backend` 資料夾說明

`/backend` 內放的是目前已完成的 Go 後端 API 專案。

```text
/backend
├─ config/
├─ handlers/
├─ models/
├─ routes/
├─ scheduler/
├─ .env.example
├─ go.mod
├─ go.sum
└─ main.go
```

### `backend/main.go`
功能：後端系統啟動入口。

主要負責：

1. 載入環境變數
2. 建立資料庫連線
3. 執行 migration
4. 啟動 scheduler
5. 啟動 Gin API server

### `backend/.env.example`
功能：後端環境變數範例檔。

### `backend/go.mod`
功能：後端 Go module 定義檔。

### `backend/go.sum`
功能：後端依賴套件 checksum。

---

## 五、`/backend/config`

### `backend/config/database.go`
功能：建立與管理 MariaDB / GORM 資料庫連線。

具體包含：

- 讀取 `.env`
- 組裝 DB 設定
- 建立 GORM 連線
- 設定 connection pool
- 驗證 DB 是否可連線

---

## 六、`/backend/models`

### `backend/models/asset.go`
功能：定義資產與資產識別碼資料表。

包含：

- `Asset`
- `AssetSN`

### `backend/models/master.go`
功能：定義主檔資料表。

包含：

- `Category`
- `Location`
- `Supplier`
- `Unit`
- `AutoMigrateMasters()`

### `backend/models/renewal.go`
功能：定義續約主單與續約明細資料表。

包含：

- `Renewal`
- `RenewalItem`

### `backend/models/migrate.go`
功能：統一執行整個 backend 的 migration。

---

## 七、`/backend/handlers`

### `backend/handlers/response.go`
功能：統一 API 成功/失敗回應格式。

### `backend/handlers/asset_handler.go`
功能：處理資產與 SN 相關 API。

包含：

- 建立資產
- 查詢資產列表
- 查詢單筆資產
- 更新資產
- 刪除資產
- 新增 SN
- 刪除 SN

### `backend/handlers/master_handler.go`
功能：處理 Category / Location / Supplier / Unit 的通用 CRUD。

### `backend/handlers/renewal_handler.go`
功能：處理續約建立與續約完成流程。

特性：

- 使用 transaction
- 續約建立時更新 asset 狀態
- 續約完成時回寫資產資料

---

## 八、`/backend/routes`

### `backend/routes/routes.go`
功能：定義所有 API 路由。

目前包含：

- `/health`
- `/api/assets`
- `/api/categories`
- `/api/locations`
- `/api/suppliers`
- `/api/units`
- `/api/renewals`
- `/api/renewals/complete`

---

## 九、`/backend/scheduler`

### `backend/scheduler/reminder.go`
功能：背景排程提醒模組。

主要邏輯：

- 定期掃描 asset
- 判斷是否接近 `next_billing_date`
- 若達提醒條件則輸出 log

---

## 十、`/frontend` 資料夾說明

`/frontend` 是前端預留區，目前尚未初始化實際框架，但未來可直接在這裡建立：

- React
- Vue
- Next.js

### `frontend/README.md`
功能：說明這個資料夾是前端工作區，並提供未來接 API 的基本方向。

---

## 十一、建議的開發方式

### 啟動 backend
```bash
cd backend
go run main.go
```

### 測試 backend
```bash
cd backend
go test ./...
```

### 建立 frontend
之後可在 `frontend/` 中執行例如：

```bash
npm create vite@latest
```

或：

```bash
npx create-next-app@latest .
```

---

## 十二、總結

這次分拆後的重點是：

- 同一個 repo 保留前後端
- 後端集中放在 `backend/`
- 前端集中放在 `frontend/`
- 避免 root 層直接混放 Go 與前端框架檔案
- 讓未來前端專案更容易獨立開發與部署

如果你想要，我下一步可以直接幫你：

1. 在 `frontend/` 幫你建立 **React + Vite**
2. 幫你建立前端呼叫 `/api/assets` 的頁面
3. 幫你把 backend 改成更適合前後端同 repo 的啟動方式
