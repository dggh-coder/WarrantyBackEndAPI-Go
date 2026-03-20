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
VITE_API_BASE_URL=http://192.168.8.130:8080
```

如果前端是從其他電腦的瀏覽器開啟，請把 `VITE_API_BASE_URL` 設成後端主機可被該瀏覽器存取的位址，例如：

```env
VITE_API_BASE_URL=http://192.168.8.130:8080
```

若未設定，前端現在會自動改用「目前瀏覽器所在主機名稱 + `:8080`」作為預設 API 位址。

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
