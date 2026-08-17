import React from "react";
import { Mail } from "lucide-react";

export default function PersonalProfileCard({ user }) {
  const userName = user?.name || user?.username || "Nama Karyawan";
  const initials = userName.charAt(0).toUpperCase();
  
  return (
    <div className="pd-card pd-profile-card">
      <div className="pd-profile-left">
        <div className="pd-avatar">
          {initials}
        </div>
        <div className="pd-profile-info">
          <h2>{userName}</h2>
          <p>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              {user?.role === 'DOSEN' ? 'Dosen' : 'Karyawan'}
            </span>
          </p>
        </div>
      </div>
      <div className="pd-profile-right">
        <Mail size={16} />
        {user?.email || "email@pbjt.ac.id"}
      </div>
    </div>
  );
}
