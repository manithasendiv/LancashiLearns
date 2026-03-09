import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "../features/auth/pages/RegisterPage";
import LoginPage from "../features/auth/pages/LoginPage";
import AcademicSelectionPage from "../features/profile/pages/AcademicSelectionPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ModulePage from "../features/module/pages/ModulePage";

function Home() {
  return <div className="p-6 text-2xl font-bold">University Learning Platform</div>;
}

function AdminPage() {
  return <div className="p-6">Admin Dashboard</div>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/academic-selection" element={<AcademicSelectionPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/modules/:moduleId" element={<ModulePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}