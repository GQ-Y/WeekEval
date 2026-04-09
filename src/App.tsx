/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import DataUpload from './pages/admin/DataUpload';
import AutoScore from './pages/admin/AutoScore';
import ReportScore from './pages/admin/ReportScore';
import EvaluationSummary from './pages/admin/EvaluationSummary';
import PublishHistory from './pages/admin/PublishHistory';
import PublicRanking from './pages/PublicRanking';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/public" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/public" element={<PublicRanking />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="upload" replace />} />
          <Route path="upload" element={<DataUpload />} />
          <Route path="calculate" element={<AutoScore />} />
          <Route path="report" element={<ReportScore />} />
          <Route path="evaluation" element={<EvaluationSummary />} />
          <Route path="publish" element={<PublishHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

