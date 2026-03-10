import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "../features/auth/pages/RegisterPage";
import LoginPage from "../features/auth/pages/LoginPage";
import AcademicSelectionPage from "../features/profile/pages/AcademicSelectionPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ModulePage from "../features/module/pages/ModulePage";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminRoute from "../components/common/AdminRoute";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
import ManageModulesPage from "../features/admin/pages/ManageModulesPage";

function Home() {
  return <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/academic-selection"
          element={
            <ProtectedRoute>
              <AcademicSelectionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/modules/:moduleId"
          element={
            <ProtectedRoute>
              <ModulePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/modules"
          element={
            <AdminRoute>
              <ManageModulesPage />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}