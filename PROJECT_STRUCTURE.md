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
# WarrantyBackEndAPI-Go 專案結構說明

本文件用來說明目前專案中每一個資料夾與每一個主要檔案的實際功能，方便開發、維運、交接與除錯。

---

## 一、專案整體用途

本專案是一個使用 **Go + Gin + GORM + MariaDB** 建立的後端 RESTful API，主要功能包含：

- 資產管理（Asset Management）
- 資產識別碼管理（AssetSN，可表示 SN / PO / License Key）
- 主檔管理（Category / Location / Supplier / Unit）
- 續約流程（Renewal / RenewalItem）
- 排程提醒（Scheduler）

系統啟動後，會依序完成：

1. 載入環境變數
2. 連線資料庫
3. 執行資料表 migration
4. 啟動提醒排程
5. 啟動 Gin API Server

---

## 二、資料夾與檔案總覽

```text
/config
  database.go
/models
  asset.go
  master.go
  migrate.go
  renewal.go
/handlers
  asset_handler.go
  master_handler.go
  renewal_handler.go
  response.go
/routes
  routes.go
/scheduler
  reminder.go
/main.go
/.env.example
/go.mod
/go.sum
```

---

## 三、各資料夾用途說明

### 1. `/config`
用途：放置系統設定、資料庫連線、環境變數讀取等設定相關程式。

目前這個資料夾主要處理：

- 讀取 `.env` 或系統環境變數
- 封裝 MariaDB 連線設定
- 建立 GORM database connection
- 設定 connection pool

#### `config/database.go`
功能：建立與管理資料庫連線，供 `main.go` 啟動時呼叫。

具體負責內容：

- `DatabaseConfig`：定義資料庫連線所需欄位，例如 host、port、user、password、db name。
- `LoadEnv()`：讀取 `.env` 檔案，如果找不到就改用系統環境變數。
- `LoadDatabaseConfig()`：從環境變數讀出 DB 設定，整理成 `DatabaseConfig`。
- `ConnectDatabase()`：依照設定建立 GORM / MariaDB 連線，並設定連線池與 `ping` 驗證。
- `getEnv()`：若環境變數沒設定，則回傳預設值。

簡單說：
> `config/database.go` 的核心責任就是「把資料庫連線建立好，回傳給其他程式使用」。

---

### 2. `/models`
用途：定義資料表模型（Table Models）與 migration 行為。

這一層主要代表資料庫中的表結構與欄位。

#### `models/asset.go`
功能：定義資產相關資料表。

包含兩個主要模型：

1. `Asset`
   - 代表一筆資產主資料
   - 包含資產編號、名稱、數量、主檔關聯、計價資訊、IP、狀態、日期等欄位

2. `AssetSN`
   - 代表資產下的識別碼
   - 可用於存 SN / PO / License Key 等資訊

此檔案的重點：

- 定義 `assets` 表的欄位規格
- 定義 `asset_sns` 表的欄位規格
- 定義欄位限制，例如 `uniqueIndex`、`not null`
- 定義 `Asset` 與 `AssetSN`、主檔資料間的關聯

#### `models/master.go`
功能：定義主檔資料模型。

包含四個主檔模型：

- `Category`
- `Location`
- `Supplier`
- `Unit`

此檔案也包含：

- `AutoMigrateMasters(db)`：專門處理主檔表的 migration

簡單說：
> 這個檔案管理所有下拉選單/參照資料表。

#### `models/renewal.go`
功能：定義續約流程相關資料表。

包含兩個模型：

1. `Renewal`
   - 代表一次續約單主檔
   - 包含續約單號、狀態、建立時間等欄位

2. `RenewalItem`
   - 代表續約單底下的明細
   - 對應哪一筆 asset、更新後的供應商、更新後的日期與成本

簡單說：
> `Renewal` 是主單，`RenewalItem` 是明細。

#### `models/migrate.go`
功能：統一管理整個系統的 migration 入口。

內容：

- 先執行 `AutoMigrateMasters(db)`
- 再執行 `Asset`、`AssetSN`、`Renewal`、`RenewalItem` 的 migration

簡單說：
> `models/migrate.go` 是所有資料表建立/驗證的總入口，`main.go` 只要呼叫它就好。

---

### 3. `/handlers`
用途：處理 HTTP Request / Response 的業務邏輯。

這一層負責：

- 接收 API 請求
- 驗證輸入資料
- 呼叫資料庫
- 回傳 JSON 結果

#### `handlers/response.go`
功能：集中管理 API 回應格式。

包含：

- `ErrorResponse`：統一錯誤回應結構
- `JSONError()`：回傳錯誤訊息
- `JSONMessage()`：回傳成功訊息與資料
- `abortValidationError()`：處理 request binding/validation 失敗時的錯誤回應

簡單說：
> 這個檔案負責統一 API 回傳格式，避免每個 handler 都重複寫 response。 

#### `handlers/asset_handler.go`
功能：處理資產與 SN 相關 API。

主要負責：

- `CreateAsset`：建立資產與 SN 清單
- `ListAssets`：查詢資產列表（含主檔關聯）
- `GetAsset`：查詢單筆資產明細
- `UpdateAsset`：更新資產資料
- `DeleteAsset`：刪除資產
- `AddSN`：對某筆資產新增 SN
- `RemoveSN`：移除某筆資產的某筆 SN

另外也包含：

- request DTO，例如 `AssetRequest`、`AddSNRequest`
- 輔助函式，例如日期轉換、參數 ID 解析

簡單說：
> `asset_handler.go` 是整個資產模組的主要進入點。

#### `handlers/master_handler.go`
功能：處理主檔 CRUD 的通用邏輯。

特色：

- 使用泛型 `MasterDataHandler[T]`
- 讓 Category / Location / Supplier / Unit 共用同一套 CRUD handler

主要負責：

- `Create`
- `List`
- `Get`
- `Update`
- `Delete`

簡單說：
> 這個檔案是主檔 API 的共用模板，減少重複程式碼。

#### `handlers/renewal_handler.go`
功能：處理續約流程 API。

主要負責兩個核心流程：

1. `CreateRenewal`
   - 建立續約單
   - 建立續約明細
   - 將對應資產狀態改成 `renewing`

2. `CompleteRenewal`
   - 完成續約
   - 更新資產的 supplier / expiry date / next billing date / yearly cost
   - 將資產狀態改回 `active`
   - 將 renewal 狀態改為 `completed`

此檔案的重要特性：

- 使用 transaction，確保續約流程是 all-or-nothing
- 內含 request DTO，例如 `CreateRenewalRequest`、`CompleteRenewalRequest`

簡單說：
> `renewal_handler.go` 負責整個續約商業流程，不只是單純 CRUD。

---

### 4. `/routes`
用途：集中註冊所有 HTTP 路由。

#### `routes/routes.go`
功能：建立 Gin router，並把 API endpoint 對應到各個 handler。

內容包含：

- 建立 `gin.Default()` router
- 註冊 `/health`
- 註冊 `/api/assets` 相關路由
- 註冊 `/api/categories`、`/api/locations`、`/api/suppliers`、`/api/units`
- 註冊 `/api/renewals` 與 `/api/renewals/complete`
- 透過 `registerMasterRoutes()` 共用主檔 CRUD 路由註冊邏輯

簡單說：
> `routes/routes.go` 專門決定「哪個 URL 會對應到哪個 handler」。

---

### 5. `/scheduler`
用途：放排程或背景工作。

#### `scheduler/reminder.go`
功能：處理每日提醒的背景任務。

主要負責：

- 建立 `ReminderScheduler`
- 啟動 ticker 週期性執行
- 查詢資料庫中的 asset
- 根據 `next_billing_date` 與 `remind_before_days` 判斷是否要提醒
- 若達到提醒條件，輸出 log：`Reminder: Asset {item_number} is due`

簡單說：
> 這個檔案是模擬 email reminder 的排程模組。

---

## 四、根目錄主要檔案說明

### `main.go`
功能：整個系統的啟動入口。

它負責把所有模組串起來：

1. 載入環境變數
2. 讀取 DB config
3. 建立 DB connection
4. 執行 migration
5. 啟動 scheduler
6. 設定 router
7. 啟動 HTTP server

簡單說：
> `main.go` 是 orchestrator，負責把 config、models、scheduler、routes 串起來。

### `.env.example`
功能：提供環境變數範本。

內容包含：

- `APP_PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_CHARSET`
- `DB_PARSE_TIME`
- `DB_LOC`
- `SCHEDULER_INTERVAL`

簡單說：
> 新環境部署時，可複製成 `.env` 並修改為實際設定。

### `go.mod`
功能：Go module 定義檔。

內容用來：

- 定義專案 module 名稱
- 管理主要依賴套件版本
- 讓 Go 工具知道需要哪些第三方套件

### `go.sum`
功能：紀錄依賴套件的 checksum。

用途：

- 驗證下載的套件內容正確性
- 確保不同環境安裝到一致的依賴內容

---

## 五、程式啟動時各層之間的關係

可以把整個呼叫流程理解成：

```text
main.go
 ├─ config.LoadEnv()
 ├─ config.LoadDatabaseConfig()
 ├─ config.ConnectDatabase()
 ├─ models.AutoMigrate()
 ├─ scheduler.NewReminderScheduler(...).Start()
 └─ routes.SetupRouter(...)
      ├─ handlers.NewAssetHandler(...)
      ├─ handlers.NewRenewalHandler(...)
      └─ handlers.NewMasterDataHandler(...)
```

也就是說：

- `config` 負責提供資料庫連線
- `models` 負責定義資料表與 migration
- `handlers` 負責 API 邏輯
- `routes` 負責 URL 對應
- `scheduler` 負責背景提醒
- `main.go` 負責把所有模組組裝起來

---

## 六、如果未來要擴充，可以怎麼放

### 若要新增模組，例如「使用者管理」
可以新增：

- `models/user.go`
- `handlers/user_handler.go`
- 在 `routes/routes.go` 增加 `/api/users`
- 若要 migration，更新 `models/migrate.go`

### 若要新增 service layer
目前專案是直接在 handler 中使用 GORM。
如果未來邏輯變複雜，可新增：

- `/services`
- `/repositories`
- `/dto`
- `/middleware`

讓架構更清楚。

---

## 七、給維護者的快速理解方式

若你是第一次接手這個專案，建議閱讀順序如下：

1. `main.go`
2. `config/database.go`
3. `routes/routes.go`
4. `handlers/asset_handler.go`
5. `handlers/renewal_handler.go`
6. `models/*.go`
7. `scheduler/reminder.go`

這樣最容易理解「系統是怎麼啟動、路由怎麼進來、資料怎麼寫進 DB」。

---

## 八、總結

這個專案目前的架構可以簡單理解成：

- `config`：設定與資料庫連線
- `models`：資料表結構與 migration
- `handlers`：API 邏輯處理
- `routes`：路由綁定
- `scheduler`：背景排程提醒
- `main.go`：系統啟動總入口

如果你想要，我下一步也可以再幫你補一份：

1. **API 文件版**（每個 endpoint 的用途、request、response）
2. **資料表設計文件版**（每張表有哪些欄位與關聯）
3. **系統流程圖版**（建立資產、建立續約、完成續約的流程）
