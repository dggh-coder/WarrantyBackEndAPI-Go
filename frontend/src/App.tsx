import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Spin } from 'antd';
import AppLayout from './layouts/AppLayout';

const AssetListPage = lazy(() => import('./pages/AssetListPage'));
const AssetFormPage = lazy(() => import('./pages/AssetFormPage'));
const AssetDetailPage = lazy(() => import('./pages/AssetDetailPage'));
const RenewalCreatePage = lazy(() => import('./pages/RenewalCreatePage'));
const RenewalCompletePage = lazy(() => import('./pages/RenewalCompletePage'));
const MasterDataPage = lazy(() => import('./pages/MasterDataPage'));

const RouteLoader = () => (
  <div className="route-loader">
    <Spin size="large" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/assets" replace />} />
          <Route path="/assets" element={<AssetListPage />} />
          <Route path="/assets/new" element={<AssetFormPage mode="create" />} />
          <Route path="/assets/:id" element={<AssetDetailPage />} />
          <Route path="/assets/:id/edit" element={<AssetFormPage mode="edit" />} />
          <Route path="/renewals/create" element={<RenewalCreatePage />} />
          <Route path="/renewals/complete" element={<RenewalCompletePage />} />
          <Route path="/masters/:resource" element={<MasterDataPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
