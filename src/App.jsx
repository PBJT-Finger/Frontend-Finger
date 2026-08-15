// ==================== APP.JSX WITH ROUTING ====================
// File: src/App.jsx
// Dashboard sekarang sudah terintegrasi — tidak perlu route /realtime terpisah.

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import PersonalDashboard from "./pages/PersonalDashboard";
import { authService } from "./services/authService";

// ==================== PROTECTED ROUTE ====================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const user = authService.getCurrentUser();
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Jika rolenya DOSEN/KARYAWAN tapi mencoba akses /dashboard Admin
    if (user.role === 'DOSEN' || user.role === 'KARYAWAN') {
      return <Navigate to="/my-dashboard" replace />;
    }
    // Jika rolenya ADMIN/PIMPINAN tapi mencoba akses /my-dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ==================== PUBLIC ROUTE ====================
const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  if (isAuthenticated) {
    const user = authService.getCurrentUser();
    if (user && (user.role === 'DOSEN' || user.role === 'KARYAWAN')) {
      return <Navigate to="/my-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// ==================== MAIN APP ====================
import DashboardLayout from "./layouts/DashboardLayout";
import OverviewPage from "./pages/dashboard/OverviewPage";
import RealtimePage from "./pages/dashboard/RealtimePage";
import RekapPage from "./pages/dashboard/RekapPage";
import UserManagementPage from "./pages/dashboard/UserManagementPage";

import PersonalLayout from "./layouts/PersonalLayout";
import PersonalHomePage from "./pages/personal/PersonalHomePage";
import PersonalRiwayatPage from "./pages/personal/PersonalRiwayatPage";
import PersonalSettingsPage from "./pages/personal/PersonalSettingsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* Protected Routes - ADMIN & PIMPINAN (Nested Routing) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'pimpinan', 'ADMIN', 'PIMPINAN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="realtime" element={<RealtimePage />} />
          <Route path="rekap-dosen" element={<RekapPage type="dosen" />} />
          <Route path="rekap-karyawan" element={<RekapPage type="karyawan" />} />
          <Route path="users" element={<UserManagementPage />} />
        </Route>

        {/* Protected Routes - DOSEN & KARYAWAN (Nested Routing) */}
        <Route
          path="/my-dashboard"
          element={
            <ProtectedRoute allowedRoles={['dosen', 'karyawan', 'DOSEN', 'KARYAWAN']}>
              <PersonalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PersonalHomePage />} />
          <Route path="riwayat" element={<PersonalRiwayatPage />} />
          <Route path="pengaturan" element={<PersonalSettingsPage />} />
        </Route>

        {/* Legacy routes mapping */}
        <Route path="/realtime" element={<Navigate to="/dashboard/realtime" replace />} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
