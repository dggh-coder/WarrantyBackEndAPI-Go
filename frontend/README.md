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
VITE_API_BASE_URL=http://localhost:8080
```

## 目前功能

- Asset List / Search / Sort / Renewal Selection
- Create / Edit Asset Form
- Asset Detail
- Renewal Phase 1 / Phase 2
- Master Data CRUD Pages
- `/api/me` 身分資訊載入（若後端尚未提供，會暫時以 local-admin write fallback 顯示，方便先測功能）
