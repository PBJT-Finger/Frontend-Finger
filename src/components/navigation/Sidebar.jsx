import React from "react";
import { ChevronLeft, ChevronRight, LogOut, BarChart2, X } from "lucide-react";
import { NavLink } from "react-router-dom";

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
              {user.role?.toUpperCase() === "PIMPINAN" ? (
                <span
                  style={{
                    fontSize: 10, fontWeight: 700, color: "#d97706",
                    background: "#fef3c7", padding: "1px 6px",
                    borderRadius: 4, width: "fit-content", marginTop: 4,
                  }}
                >
                  PIMPINAN
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 10, fontWeight: 700, color: "#059669",
                    background: "#d1fae5", padding: "1px 6px",
                    borderRadius: 4, width: "fit-content", marginTop: 4,
                  }}
                >
                  ADMIN
                </span>
              )}
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
