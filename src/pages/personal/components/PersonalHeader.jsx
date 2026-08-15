import React from "react";
import { LogOut } from "lucide-react";
import { authService } from "../../../services/authService";
import { useNavigate } from "react-router-dom";

export default function PersonalHeader({ user, summary, sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <header className="pd-header">
      <div className="pd-header-top">
        <div className="pd-greeting" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Menu button for mobile/collapsed desktop to toggle sidebar */}
          <button 
            className="topbar-toggle-btn" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ 
              color: "white", 
              borderColor: "rgba(255,255,255,0.3)", 
              background: "rgba(255,255,255,0.1)",
              borderRadius: "6px",
              padding: "6px"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          
          <div>
            <h1 className="pd-title">Halo, {user?.name || "Karyawan"}</h1>
            <span className="pd-role">{user?.role || "DOSEN"}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="pd-logout-btn" aria-label="Logout">
          <LogOut size={20} />
        </button>
      </div>

      <div className="pd-stats-container">
        <div className="pd-stat-card">
          <p className="pd-stat-label">Hadir (Bulan Ini)</p>
          <p className="pd-stat-value">{summary?.hadir || 0}</p>
        </div>
        <div className="pd-stat-card">
          <p className="pd-stat-label">Terlambat</p>
          <p className="pd-stat-value">{summary?.terlambat || 0}</p>
        </div>
      </div>
    </header>
  );
}
