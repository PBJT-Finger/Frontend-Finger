import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, Settings, LogOut, Menu, ChevronRight } from "lucide-react";
import Sidebar from "../components/navigation/Sidebar";
import BottomNav from "../components/navigation/BottomNav";
import { authService } from "../services/authService";

export default function PersonalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 769);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 769) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const navItems = [
    { key: "home", path: "/my-dashboard", label: "Beranda", icon: Home },
    { key: "riwayat", path: "/my-dashboard/riwayat", label: "Riwayat", icon: Calendar },
    { key: "pengaturan", path: "/my-dashboard/pengaturan", label: "Pengaturan", icon: Settings },
  ];

  const currentNav = navItems.find((n) => n.path === location.pathname) || navItems[0];
  const sectionTitle = currentNav.label;

  return (
    <div className={`dash-shell ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navItems={navItems}
        user={user}
        handleLogout={handleLogout}
      />

      <div className="dash-main" style={{ backgroundColor: "#f8fafc" }}>
        <header className="dash-topbar" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", color: "white", padding: "16px 24px", border: "none" }}>
          <div className="topbar-left">
            <button className="topbar-toggle-btn" onClick={() => setSidebarOpen((o) => !o)} style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}>
              <Menu size={18} />
            </button>
            <div className="topbar-breadcrumb">
              <span className="topbar-breadcrumb-root" style={{ color: "rgba(255,255,255,0.8)" }}>Dasbor Personal</span>
              <ChevronRight size={14} className="topbar-bc-sep" style={{ color: "rgba(255,255,255,0.8)" }} />
              <span className="topbar-breadcrumb-current" style={{ color: "white" }}>{sectionTitle}</span>
            </div>
          </div>
          <div className="topbar-right">
             <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", padding: 8, color: "white", cursor: "pointer" }}>
                <LogOut size={16} />
             </button>
          </div>
        </header>

        <main className="dash-content pb-20 md:pb-6" style={{ padding: "24px" }}>
          <Outlet />
        </main>
      </div>

      <BottomNav navItems={navItems} />

      {sidebarOpen && window.innerWidth < 768 && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
