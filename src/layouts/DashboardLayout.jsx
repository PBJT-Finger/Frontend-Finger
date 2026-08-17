import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Activity,
  Users,
  Briefcase,
  Cpu,
  Menu,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../components/navigation/Sidebar";
import BottomNav from "../components/navigation/BottomNav";
import { authService } from "../services/authService";
import { useEmployees } from "../hooks/useEmployees";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 769);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 769);

  // Pakai hook karyawan untuk dapat badge 'unregisteredCount'
  const { unregisteredCount } = useEmployees();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 769;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // Setup Menu Navigasi
  const navItems = [
    { key: "overview", path: "/dashboard", label: "Overview", icon: Home },
    { key: "realtime", path: "/dashboard/realtime", label: "Live Realtime", icon: Activity, badge: "LIVE" },
    { key: "dosen", path: "/dashboard/rekap-dosen", label: "Rekap Dosen", icon: Users },
    { key: "karyawan", path: "/dashboard/rekap-karyawan", label: "Rekap Karyawan", icon: Briefcase },
  ];

  if (user?.role?.toLowerCase() !== "pimpinan") {
    navItems.push({
      key: "users",
      path: "/dashboard/users",
      label: "Manajemen Pengguna",
      icon: Cpu,
      badge: unregisteredCount > 0 ? String(unregisteredCount) : null,
      isDangerBadge: true,
    });
  }

  // Tentukan judul halaman berdasarkan URL (hanya untuk Topbar mobile)
  const currentNav = navItems.find((n) => n.path === location.pathname) || navItems[0];
  const sectionTitle = currentNav.label;

  return (
    <div className={`dash-shell ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
      {/* Sidebar untuk Desktop */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navItems={navItems}
        user={user}
        handleLogout={handleLogout}
      />

      <div className="dash-main">
        {/* Topbar (Terutama untuk Mobile) */}
        <header className="dash-topbar">
          <div className="topbar-left">
            <button
              className="topbar-toggle-btn"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              <Menu size={18} />
            </button>
            <div className="topbar-breadcrumb">
              <span className="topbar-breadcrumb-root">Dashboard</span>
              <ChevronRight size={14} className="topbar-bc-sep" />
              <span className="topbar-breadcrumb-current">{sectionTitle}</span>
            </div>
          </div>
          <div className="topbar-right">
            {location.pathname === "/dashboard/realtime" && (
              <div className="topbar-live-badge">
                <span className="rt-pulse-dot" /> REAL-TIME
              </div>
            )}
          </div>
        </header>

        {/* Konten Halaman */}
        <main className="dash-content pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation untuk Mobile */}
      <BottomNav navItems={navItems} />

      {/* Backdrop Mobile untuk Sidebar (reactive) */}
      {sidebarOpen && isMobile && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
