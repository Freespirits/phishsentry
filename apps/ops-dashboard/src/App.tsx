import { Navigate, Route, Routes } from 'react-router-dom';
import { Suspense } from 'react';
import Layout from './components/Layout';
import AlertsPage from './pages/AlertsPage';
import UrlDetailPage from './pages/UrlDetailPage';
import FeedStatisticsPage from './pages/FeedStatisticsPage';
import ModelMetricsPage from './pages/ModelMetricsPage';
import BlocklistManagerPage from './pages/BlocklistManagerPage';
import LoginPage from './pages/LoginPage';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="alerts" replace />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="alerts/:alertId" element={<UrlDetailPage />} />
          <Route path="feed" element={<FeedStatisticsPage />} />
          <Route path="metrics" element={<ModelMetricsPage />} />
          <Route path="lists" element={<BlocklistManagerPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
