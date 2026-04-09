import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "../features/auth/pages/RegisterPage";
import LoginPage from "../features/auth/pages/LoginPage";
import AcademicSelectionPage from "../features/profile/pages/AcademicSelectionPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ModulePage from "../features/module/pages/ModulePage";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminRoute from "../components/common/AdminRoute";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
import ManageModulesPage from "../features/admin/pages/ManageModulesPage";
import ManageUsersPage from "../features/admin/pages/ManageUsersPage";
import ManageMaterialsPage from "../features/admin/pages/ManageMaterialsPage";
import EditModulePage from "../features/admin/pages/EditModulePage";
import EditMaterialPage from "../features/admin/pages/EditMaterialPage";
import MyStoragePage from "../features/storage/pages/MyStoragePage";
import NotesPage from "../features/notes/pages/NotesPage";

function Home() {
  // Keep root deterministic by sending users to the auth entry page.
  return <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    // BrowserRouter provides clean URL navigation for the single-page app.
    <BrowserRouter>
      {/* Routes acts as a switch and renders the first matching route. */}
      <Routes>
        {/* Public entry redirect and auth pages. */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Student-only/private pages are wrapped with the auth guard. */}
        <Route
          path="/academic-selection"
          element={
            <ProtectedRoute>
              <AcademicSelectionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
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
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesPage />
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

        {/* Admin-only pages are grouped under dedicated admin paths. */}
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

        <Route
          path="/admin/modules/:moduleId/edit"
          element={
            <AdminRoute>
              <EditModulePage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <ManageUsersPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/materials"
          element={
            <AdminRoute>
              <ManageMaterialsPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/materials/:moduleId/:materialId/edit"
          element={
            <AdminRoute>
              <EditMaterialPage />
            </AdminRoute>
          }
        />

        <Route
          path="/storage"
          element={
            <ProtectedRoute>
              <MyStoragePage />
            </ProtectedRoute>
          }
        />

        {/* Unknown paths resolve to login instead of a blank/404 screen. */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}