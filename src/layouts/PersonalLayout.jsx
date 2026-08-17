import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import Sidebar from "../components/navigation/Sidebar";
import { authService } from "../services/authService";

export default function PersonalLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 769);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 769);

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
        <main className="dash-content" style={{ padding: 0, maxWidth: "100%", overflowX: "hidden" }}>
          <Outlet context={{ sidebarOpen, setSidebarOpen, user }} />
        </main>
      </div>

      {sidebarOpen && isMobile && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
