// ==================== DOSEN TABLE ====================
// File: src/components/DosenTable.jsx

import React, { useState, useMemo } from "react";
import { XCircle, Sun, Moon } from "lucide-react";

// ==================== HELPER: SESI DARI JAM ====================
// Dipakai jika backend tidak mengirim field 'sesi'
function getSesiFromTime(timeStr) {
  if (!timeStr) return null;
  if (timeStr.includes("-") || timeStr.includes("T")) {
    const date = new Date(timeStr.replace(" ", "T"));
    if (!isNaN(date.getTime())) {
      // Backend encodes local time into UTC slots — always use getUTCHours()
      const hour = date.getUTCHours();
      if (hour >= 6 && hour < 15) return "pagi";
      if (hour >= 15 && hour <= 22) return "malam";
    }
  }
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    const hour = parseInt(parts[0], 10);
    if (!isNaN(hour)) {
      if (hour >= 6 && hour < 15) return "pagi";
      if (hour >= 15 && hour <= 22) return "malam";
    }
  }
  return null;
}

// ==================== BADGE SESI ====================
function SesiBadge({ sesi }) {
  if (sesi === "pagi") {
    return (
      <span className="badge badge-pagi">
        <Sun size={11} />
        Pagi
      </span>
    );
  }
  if (sesi === "malam") {
    return (
      <span className="badge badge-malam">
        <Moon size={11} />
        Malam
      </span>
    );
  }
  return <span className="badge badge-neutral">—</span>;
}

// ==================== DOSEN TABLE COMPONENT ====================
const DosenTable = ({ data, searchTerm }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const filteredData = data.filter(
    (dosen) =>
      (dosen.nama || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()) ||
      (dosen.id || "").toString().includes(searchTerm || ""),
  );

  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortableHeader = (label, key, align = "center") => (
    <th
      style={{ textAlign: align, cursor: "pointer" }}
      onClick={() => requestSort(key)}
      className="hover:bg-gray-50 transition-colors"
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: align === "left" ? "flex-start" : "center", gap: "4px" }}>
        {label}
      </div>
    </th>
  );

  if (filteredData.length === 0) {
    return (
      <div className="no-data-container">
        <XCircle size={64} className="no-data-icon" />
        <p className="no-data-text">Tidak ada data dosen yang ditemukan</p>
      </div>
    );
  }

  return (
    <div className="dual-view-container">
      {/* 1) Desktop Table View */}
      <div className="table-wrapper desktop-table-view">
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>No</th>
              {renderSortableHeader("Nama", "nama", "left")}
              <th style={{ textAlign: "center" }}>Sesi</th>
              {renderSortableHeader("Hadir", "totalHadir")}
              {renderSortableHeader("Tidak Hadir", "tidakHadir")}
              {renderSortableHeader("Terlambat", "totalTerlambat")}
              {renderSortableHeader("Total Hari Kerja", "totalHariKerja")}
              <th style={{ textAlign: "center" }}>Waktu Kehadiran</th>
              <th style={{ textAlign: "center" }}>Check In Terakhir</th>
              <th style={{ textAlign: "center" }}>Check Out Terakhir</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((dosen, index) => {
              const sesi = dosen.sesi || getSesiFromTime(dosen.lastCheckIn);
              return (
                <tr key={dosen.id || index}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td style={{ textAlign: "left", fontWeight: "600" }}>{dosen.nama || "N/A"}</td>
                  <td style={{ textAlign: "center" }}>
                    <SesiBadge sesi={sesi} />
                  </td>
                  <td style={{ textAlign: "center" }}>{dosen.totalHadir || 0}</td>
                  <td style={{ textAlign: "center", color: "#9CA3AF" }}>{dosen.tidakHadir ?? 0}</td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ color: "#EF4444", fontWeight: "600" }}>{dosen.totalTerlambat || 0}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>{dosen.totalHariKerja || 0}</td>
                  <td style={{ textAlign: "center" }}>{dosen.attendanceDates || "Belum ada data"}</td>
                  <td style={{ textAlign: "center" }}>{dosen.lastCheckIn || "Belum ada data"}</td>
                  <td style={{ textAlign: "center" }}>{dosen.lastCheckOut || "Belum ada data"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 2) Mobile Card View */}
      <div className="mobile-card-list">
        {sortedData.map((dosen, index) => {
          const sesi = dosen.sesi || getSesiFromTime(dosen.lastCheckIn);
          return (
            <div key={dosen.id || index} className="mobile-employee-card">
              <div className="mec-header">
                <div className="mec-name-section">
                  <div className="mec-avatar">{(dosen.nama || "U").charAt(0).toUpperCase()}</div>
                  <div className="mec-name">{dosen.nama || "N/A"}</div>
                </div>
                <div className="mec-no">#{index + 1}</div>
              </div>
              <div className="mec-body">
                <div className="mec-row-flex">
                  <div className="mec-stat">
                    <span className="mec-stat-label">Sesi</span>
                    <SesiBadge sesi={sesi} />
                  </div>
                  <div className="mec-stat">
                    <span className="mec-stat-label">Hadir</span>
                    <span className="mec-stat-val text-green">{dosen.totalHadir || 0}</span>
                  </div>
                  <div className="mec-stat">
                    <span className="mec-stat-label">Alpha</span>
                    <span className="mec-stat-val text-gray">{dosen.tidakHadir ?? 0}</span>
                  </div>
                  <div className="mec-stat">
                    <span className="mec-stat-label">Telat</span>
                    <span className="mec-stat-val text-red">{dosen.totalTerlambat || 0}</span>
                  </div>
                </div>
                
                <div className="mec-divider"></div>
                
                <div className="mec-detail-row">
                  <span className="mec-detail-label">Hari Kerja</span>
                  <span className="mec-detail-value">{dosen.totalHariKerja || 0}</span>
                </div>
                <div className="mec-detail-row">
                  <span className="mec-detail-label">Check-In Terakhir</span>
                  <span className="mec-detail-value">{dosen.lastCheckIn || "-"}</span>
                </div>
                <div className="mec-detail-row">
                  <span className="mec-detail-label">Check-Out Terakhir</span>
                  <span className="mec-detail-value">{dosen.lastCheckOut || "-"}</span>
                </div>
                
                <div className="mec-detail-col">
                  <span className="mec-detail-label">Riwayat Waktu Kehadiran</span>
                  <div className="mec-dates-box">{dosen.attendanceDates || "Belum ada riwayat"}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DosenTable;
