import React from "react";
import { NavLink } from "react-router-dom";
import "./BottomNav.css";

export default function BottomNav({ navItems }) {
  // Hanya ambil maksimal 5 item utama untuk BottomNav agar tidak sempit
  const visibleItems = navItems.slice(0, 5);

  return (
    <nav className="bottom-nav">
      {visibleItems.map(({ key, path, label, icon: Icon, badge, isDangerBadge }) => (
        <NavLink
          key={key}
          to={path}
          end
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <div className="bottom-nav-icon-wrapper">
            <Icon size={22} className="bottom-nav-icon" />
            {badge && (
              isDangerBadge ? (
                <span className="bottom-nav-badge-danger">{badge}</span>
              ) : (
                <span className="bottom-nav-live-dot" />
              )
            )}
          </div>
          <span className="bottom-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
