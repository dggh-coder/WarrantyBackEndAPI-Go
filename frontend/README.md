# Frontend Application

這個資料夾現在已包含一個可執行的 React + Vite + TypeScript 前端專案，對接同 repository 內 `backend/` 的 Go REST API。

## 技術棧

- React 18
- Vite
- TypeScript
- Ant Design
- TanStack React Query
- Axios
- React Router

## 啟動方式

```bash
cd frontend
npm install
npm run dev
```

## 建議環境變數

複製 `.env.example` 為 `.env`：

```env
VITE_API_BASE_URL=http://127.0.0.1:8080
```

也支援舊名稱 `VITE_API_BASE_URI`，但建議統一改用 `VITE_API_BASE_URL`。修改 `.env` 後請重新啟動 `npm run dev`。

### Ubuntu / LAN 開發建議

前端在 `npm run dev` 開發模式下，現在會透過 **Vite dev proxy** 轉送 `/api` 請求，因此瀏覽器不會直接連到 `:8080`。

也就是說：

- 瀏覽器開的是 `http://192.168.8.130:5173`
- Vite server 再把 `/api/*` 代理到 `VITE_API_BASE_URL`

所以在 Ubuntu 主機上開發時，`frontend/.env` 通常可直接設成：

```env
VITE_API_BASE_URL=http://127.0.0.1:8080
```

即使你是從別台電腦用瀏覽器開 `http://192.168.8.130:5173`，這樣也可以正常工作，因為代理發生在 Ubuntu 上的 Vite server，不是在瀏覽器端。

如果 backend 不在同一台主機，再把 `VITE_API_BASE_URL` 改成實際 backend 位址，例如：

```env
VITE_API_BASE_URL=http://192.168.8.130:8080
```

production build 若未設定 `VITE_API_BASE_URL`，前端才會自動改用「目前瀏覽器所在主機名稱 + `:8080`」作為預設 API 位址。

另外，backend 現在預設允許跨來源請求（CORS），也可在 `backend/.env` 用 `APP_ALLOWED_ORIGINS` 限制允許的前端來源。

## 目前功能

- Asset List / Search / Sort / Renewal Selection
- Create / Edit Asset Form
- Asset Detail
- Renewal Phase 1 / Phase 2
- Master Data CRUD Pages
- `/api/me` 身分資訊載入（後端現已提供；若 API 暫時不可用，前端仍會暫時以 local-admin write fallback 顯示，方便先測功能）

## `/api/me` 後端設定

backend 預設會回傳：

- `username: local-admin`
- `role: write`

可透過環境變數覆蓋：

```env
APP_AUTH_USERNAME=qa-user
APP_AUTH_ROLE=read
```

`APP_AUTH_ROLE` 只接受 `read` 或 `write`。


## 空資料回應行為

- List 類 API 若回傳 `data: null`，前端會視為空陣列顯示，不再直接報 Network Error。
- Detail / create / update / renewal 類 API 若回傳空資料，前端會顯示較明確的錯誤訊息。
