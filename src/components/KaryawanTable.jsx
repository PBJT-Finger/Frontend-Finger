// ==================== KARYAWAN TABLE ====================
// File: src/components/KaryawanTable.jsx

import React, { useState, useMemo } from "react";
import { XCircle } from "lucide-react";

const KaryawanTable = ({ data, searchTerm }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const filteredData = data.filter(
    (karyawan) =>
      (karyawan.nama || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()) ||
      (karyawan.id || "").toString().includes(searchTerm || ""),
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
        <p className="no-data-text">Tidak ada data karyawan yang ditemukan</p>
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
              {renderSortableHeader("Hadir", "totalHadir")}
              {renderSortableHeader("Tidak Hadir", "tidakHadir")}
              {renderSortableHeader("Total Hari Kerja", "totalHariKerja")}
              <th style={{ textAlign: "center" }}>Waktu Kehadiran</th>
              <th style={{ textAlign: "center" }}>Check In Terakhir</th>
              <th style={{ textAlign: "center" }}>Check Out Terakhir</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((karyawan, index) => (
              <tr key={karyawan.id || index}>
                <td style={{ textAlign: "center" }}>{index + 1}</td>
                <td style={{ textAlign: "left", fontWeight: "600" }}>
                  {karyawan.nama || "N/A"}
                </td>
                <td style={{ textAlign: "center" }}>
                  {karyawan.totalHadir || 0}
                </td>
                <td style={{ textAlign: "center", color: "#9CA3AF" }}>
                  {karyawan.tidakHadir ?? 0}
                </td>
                <td style={{ textAlign: "center" }}>
                  {karyawan.totalHariKerja || 0}
                </td>
                <td style={{ textAlign: "center" }}>
                  {karyawan.attendanceDates || "Belum ada data"}
                </td>
                <td style={{ textAlign: "center" }}>
                  {karyawan.lastCheckIn || "Belum ada data"}
                </td>
                <td style={{ textAlign: "center" }}>
                  {karyawan.lastCheckOut || "Belum ada data"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2) Mobile Card View */}
      <div className="mobile-card-list">
        {sortedData.map((karyawan, index) => (
          <div key={karyawan.id || index} className="mobile-employee-card">
            <div className="mec-header">
              <div className="mec-name-section">
                <div className="mec-avatar">{(karyawan.nama || "U").charAt(0).toUpperCase()}</div>
                <div className="mec-name">{karyawan.nama || "N/A"}</div>
              </div>
              <div className="mec-no">#{index + 1}</div>
            </div>
            <div className="mec-body">
              <div className="mec-row-flex">
                <div className="mec-stat">
                  <span className="mec-stat-label">Hadir</span>
                  <span className="mec-stat-val text-green">{karyawan.totalHadir || 0}</span>
                </div>
                <div className="mec-stat">
                  <span className="mec-stat-label">Alpha</span>
                  <span className="mec-stat-val text-gray">{karyawan.tidakHadir ?? 0}</span>
                </div>
                <div className="mec-stat">
                  <span className="mec-stat-label">Hari Kerja</span>
                  <span className="mec-stat-val text-blue">{karyawan.totalHariKerja || 0}</span>
                </div>
              </div>
              
              <div className="mec-divider"></div>
              
              <div className="mec-detail-row">
                <span className="mec-detail-label">Check-In Terakhir</span>
                <span className="mec-detail-value">{karyawan.lastCheckIn || "-"}</span>
              </div>
              <div className="mec-detail-row">
                <span className="mec-detail-label">Check-Out Terakhir</span>
                <span className="mec-detail-value">{karyawan.lastCheckOut || "-"}</span>
              </div>
              
              <div className="mec-detail-col">
                <span className="mec-detail-label">Riwayat Waktu Kehadiran</span>
                <div className="mec-dates-box">{karyawan.attendanceDates || "Belum ada riwayat"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KaryawanTable;
