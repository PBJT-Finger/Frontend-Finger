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
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* Protected Routes - ADMIN & PIMPINAN */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'pimpinan', 'ADMIN', 'PIMPINAN']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - DOSEN & KARYAWAN */}
        <Route
          path="/my-dashboard"
          element={
            <ProtectedRoute allowedRoles={['dosen', 'karyawan', 'DOSEN', 'KARYAWAN']}>
              <PersonalDashboard />
            </ProtectedRoute>
          }
        />

        {/* Legacy /realtime route — redirect ke /dashboard */}
        <Route
          path="/realtime"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
