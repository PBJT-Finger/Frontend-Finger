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
        <header className="dash-topbar">
          <div className="topbar-left">
            <button className="topbar-toggle-btn" onClick={() => setSidebarOpen((o) => !o)}>
              <Menu size={18} />
            </button>
            <div className="topbar-breadcrumb">
              <span className="topbar-breadcrumb-root">Dasbor Personal</span>
              <ChevronRight size={14} className="topbar-bc-sep" />
              <span className="topbar-breadcrumb-current">{sectionTitle}</span>
            </div>
          </div>
          <div className="topbar-right">
             <button onClick={handleLogout} className="topbar-toggle-btn" style={{ border: "none", background: "#fef2f2", color: "#dc2626" }} title="Logout">
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
