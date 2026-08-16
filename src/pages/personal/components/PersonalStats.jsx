import React from "react";

export default function PersonalStats({ summary }) {
  return (
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
  );
}
