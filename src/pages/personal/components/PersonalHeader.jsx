import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronRight, Menu } from "lucide-react";
import { authService } from "../../../services/authService";

/**
 * Header for Personal Dashboard (Dosen/Karyawan view).
 * Shows breadcrumb, page title, mobile sidebar toggle, and logout button.
 */
export default function PersonalHeader({ user, sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const roleLabel = user?.role === "DOSEN" ? "Dosen" : "Karyawan";

  return (
    <header className="pd-header">
      <div>
        <div className="pd-breadcrumb">
          {/* Mobile sidebar toggle — only shows on small screens via CSS */}
          <button
            className="pd-mobile-menu-btn"
            onClick={() => setSidebarOpen?.((o) => !o)}
            title="Toggle Menu"
          >
            <Menu size={18} />
          </button>
          <span>Dashboard</span>
          <ChevronRight size={14} style={{ margin: "0 6px", color: "#cbd5e1" }} />
          <span style={{ color: "#1e293b", fontWeight: 600 }}>
            Dashboard {roleLabel}
          </span>
        </div>
        <h1 className="pd-page-title">Dashboard {roleLabel}</h1>
        <p className="pd-page-subtitle">
          Selamat datang, {user?.nama || "Pegawai"}. Berikut ringkasan kehadiran pribadi Anda.
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="pd-logout-btn"
        title="Keluar"
      >
        <LogOut size={20} />
      </button>
    </header>
  );
}
