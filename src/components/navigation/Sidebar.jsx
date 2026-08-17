import React from "react";
import { ChevronLeft, ChevronRight, LogOut, BarChart2, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Download } from "lucide-react";
import { usePwaInstall } from "../../hooks/usePwaInstall";

/**
 * Sidebar navigation component.
 * - On desktop (>=769px): collapses to icon-only strip when sidebarOpen=false.
 * - On mobile (<769px): slides in from left as an overlay; toggle is in the topbar.
 * The sidebar-toggle-btn (chevron) is HIDDEN on mobile via CSS.
 * The mobile-close-btn (X) is HIDDEN on desktop via CSS.
 */
export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  navItems,
  user,
  handleLogout,
}) {
  const { isInstallable, handleInstallClick } = usePwaInstall();
  const isPersonalRole = user?.role === "DOSEN" || user?.role === "KARYAWAN";

  return (
    <aside className="dash-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-left">
          <div className="sidebar-brand-icon">
            <BarChart2 size={20} />
          </div>
          {sidebarOpen && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-title">AbsensiKampus</span>
              <span className="sidebar-brand-sub">Monitoring System</span>
            </div>
          )}
        </div>

        {/* Desktop only: collapse/expand chevron toggle */}
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen((o) => !o)}
          title={sidebarOpen ? "Tutup Menu" : "Buka Menu"}
        >
          {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>

        {/* Mobile only: close (X) button inside sidebar header */}
        <button
          className="mobile-close-btn"
          onClick={() => setSidebarOpen(false)}
          title="Tutup"
        >
          <X size={15} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ key, path, label, icon: Icon, badge, isDangerBadge }) => (
          <NavLink
            key={key}
            to={path}
            end
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? "active" : ""}`
            }
            onClick={() => {
              // Auto-close sidebar on mobile after navigation
              if (window.innerWidth < 769) {
                setSidebarOpen(false);
              }
            }}
            title={!sidebarOpen ? label : undefined}
          >
            <span className="sidebar-nav-icon">
              <Icon size={18} />
              {badge && (
                isDangerBadge ? (
                  <span
                    className="sidebar-badge-danger"
                    style={{ position: "absolute", top: -4, right: -4, fontSize: 8, padding: "1px 4px", marginLeft: 0 }}
                  >
                    {badge}
                  </span>
                ) : (
                  <span className="sidebar-live-dot" />
                )
              )}
            </span>
            {sidebarOpen && (
              <span className="sidebar-nav-label">
                {label}
                {badge && !isDangerBadge && <span className="sidebar-badge">{badge}</span>}
                {badge && isDangerBadge && <span className="sidebar-badge-danger">{badge}</span>}
              </span>
            )}
            {sidebarOpen && <ChevronRight size={14} className="sidebar-nav-arrow" />}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isInstallable && isPersonalRole && sidebarOpen && (
          <button className="sidebar-install-btn" onClick={handleInstallClick} title="Install App">
            <Download size={16} />
            <span>Install App</span>
          </button>
        )}
        {user && sidebarOpen && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {(user.name || user.username || "U").charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">
                {user.name || user.username || "User"}
              </span>
              <span className="sidebar-user-email">{user.email || ""}</span>
              {(() => {
                const role = user.role?.toUpperCase();
                const roleConfig = {
                  PIMPINAN: { label: "PIMPINAN", color: "#d97706", bg: "#fef3c7" },
                  ADMIN:    { label: "ADMIN",    color: "#059669", bg: "#d1fae5" },
                  DOSEN:    { label: "DOSEN",    color: "#1d4ed8", bg: "#dbeafe" },
                  KARYAWAN: { label: "KARYAWAN", color: "#7c3aed", bg: "#ede9fe" },
                };
                const cfg = roleConfig[role] || { label: role || "USER", color: "#64748b", bg: "#f1f5f9" };
                return (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: cfg.color, background: cfg.bg,
                    padding: "1px 6px", borderRadius: 4,
                    width: "fit-content", marginTop: 4,
                  }}>
                    {cfg.label}
                  </span>
                );
              })()}
            </div>
          </div>
        )}
        <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
