import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import Sidebar from "../components/navigation/Sidebar";
import BottomNav from "../components/navigation/BottomNav";
import { authService } from "../services/authService";

export default function PersonalLayout() {
  const navigate = useNavigate();
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
  ];

  return (
    <div className={`dash-shell ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navItems={navItems}
        user={user}
        handleLogout={handleLogout}
      />

      {/* Main Container edge-to-edge */}
      <div className="dash-main" style={{ backgroundColor: "#f1f5f9", padding: 0 }}>
        {/* Topbar removed because PersonalHeader provides it */}
        <main className="dash-content pb-20 md:pb-0" style={{ padding: 0, maxWidth: "100%", overflowX: "hidden" }}>
          <Outlet context={{ sidebarOpen, setSidebarOpen, user }} />
        </main>
      </div>

      <BottomNav navItems={navItems} />

      {sidebarOpen && window.innerWidth < 768 && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
