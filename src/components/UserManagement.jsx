import React from "react";
import { Users, Calendar, Clock, Search, X, RefreshCw } from "lucide-react";
import StatsCard from "./StatsCard";

function UserManagement({
  employees,
  empSearch,
  setEmpSearch,
  empJabatan,
  setEmpJabatan,
  employeeLoading,
  loadEmployees,
  employeeError,
  handleEditClick,
  modalOpen,
  setModalOpen,
  selectedEmp,
  formJabatan,
  setFormJabatan,
  formShift,
  setFormShift,
  handleModalSubmit,
  modalLoading,
  modalError,
}) {
  // Filter data berdasarkan search & jabatan
  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      !empSearch ||
      (emp.nama || "").toLowerCase().includes(empSearch.toLowerCase());
    const matchJabatan =
      !empJabatan ||
      (emp.jabatan || "").toUpperCase() === empJabatan.toUpperCase();
    return matchSearch && matchJabatan;
  });

  const totalTerdaftar = employees.filter((e) => e.is_active).length;
  const totalBelumTerdaftar = employees.filter((e) => !e.is_active).length;

  return (
    <div className="section-fingerprint">
      <style>
        {`
        .filter-search { flex: 1; min-width: 250px; }
        .filter-jabatan { min-width: 200px; }

        @media (max-width: 768px) {
          .filter-section {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .filter-search, .filter-jabatan {
            min-width: 100% !important;
            width: 100% !important;
          }
          .filter-jabatan select, .filter-section button {
            width: 100% !important;
            justify-content: center;
          }
        }
        `}
      </style>
      <div className="page-heading">
        <h2 className="page-title">Manajemen Pengguna</h2>
        <p className="page-sub">
          Kelola dan daftarkan data pegawai (Dosen dan Karyawan) ke dalam sistem
        </p>
      </div>

      <div className="stats-grid">
        <StatsCard
          icon={Users}
          title="Total Pengguna"
          value={employees.length}
          color="#3B82F6"
        />
        <StatsCard
          icon={Calendar}
          title="Telah Terdaftar"
          value={totalTerdaftar}
          color="#10B981"
        />
        <StatsCard
          icon={Clock}
          title="Belum Terdaftar"
          value={totalBelumTerdaftar}
          color="#EF4444"
        />
      </div>

      {/* Search & Filters */}
      <div className="filter-panel" style={{ marginBottom: "20px" }}>
        <div className="filter-section" style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-end" }}>

          {/* Search Field */}
          <div className="filter-field filter-search">
            <div className="search-wrapper" style={{ margin: 0 }}>
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Cari nama pengguna..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Jabatan Filter */}
          <div className="filter-field filter-jabatan">
            <select
              value={empJabatan}
              onChange={(e) => setEmpJabatan(e.target.value)}
              className="filter-select"
            >
              <option value="">Semua Jabatan</option>
              <option value="DOSEN">Dosen</option>
              <option value="KARYAWAN">Karyawan</option>
            </select>
          </div>

          {/* Refresh Button */}
          <div className="filter-field">
            <button
              onClick={loadEmployees}
              disabled={employeeLoading}
              className="export-btn export-btn-excel"
              style={{
                background: employeeLoading ? "#94a3b8" : "#3B82F6",
                color: "#fff",
                border: "none",
                height: "42px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: employeeLoading ? "not-allowed" : "pointer"
              }}
            >
              <RefreshCw size={16} className={employeeLoading ? "spin-animation" : ""} />
              {employeeLoading ? "Memuat..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {employeeError && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: "#b91c1c", fontSize: 13 }}>
          <span>⚠️ {employeeError}</span>
          <button onClick={loadEmployees} style={{ background: "none", border: "none", color: "#dc2626", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Coba lagi</button>
        </div>
      )}

      {/* Tabel Pegawai */}
      <div className="table-container">
        {employeeLoading && employees.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <div className="loading-text">Memuat data pegawai...</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table desktop-table-view" style={{ tableLayout: "fixed", width: "100%" }}>
              <colgroup>
                <col style={{ width: "8%" }} />
                <col style={{ width: "42%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "25%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>NO</th>
                  <th style={{ textAlign: "left" }}>NAMA</th>
                  <th style={{ textAlign: "center" }}>JABATAN</th>
                  <th style={{ textAlign: "center" }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        <span>Belum ada data pegawai</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, idx) => (
                    <tr key={emp.user_id || idx}>
                      <td style={{ textAlign: "center" }}>{idx + 1}</td>
                      <td style={{ textAlign: "left", fontSize: "13px", fontWeight: "600" }}>{emp.nama || "N/A"}</td>
                      <td style={{ textAlign: "center" }}>
                        {emp.jabatan ? (
                          <span style={{
                            fontWeight: 600,
                            color: emp.jabatan === "DOSEN" ? "#3b82f6" : "#10b981",
                            fontSize: "13px",
                          }}>
                            {emp.jabatan.charAt(0).toUpperCase() + emp.jabatan.slice(1).toLowerCase()}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "13px" }}>Belum Diatur</span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {emp.jabatan ? (
                          <button
                            onClick={() => handleEditClick(emp)}
                            style={{ padding: "5px 10px", fontSize: "13px", fontWeight: 600, borderRadius: 6, border: "none", background: "#374151", color: "#ffffff", cursor: "pointer" }}
                          >
                            Edit Jabatan
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditClick(emp)}
                            style={{ padding: "5px 10px", fontSize: "13px", fontWeight: 600, borderRadius: 6, border: "none", background: "#2563eb", color: "#ffffff", cursor: "pointer" }}
                          >
                            Atur Jabatan
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="mobile-card-list">
              {filteredEmployees.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    <span>Belum ada data pegawai</span>
                  </div>
                </div>
              ) : (
                filteredEmployees.map((emp, idx) => (
                  <div key={emp.user_id || idx} className="mobile-employee-card">
                    <div className="mec-header">
                      <div className="mec-name-section">
                        <div className="mec-avatar">{(emp.nama || "U").charAt(0).toUpperCase()}</div>
                        <div className="mec-name">{emp.nama || "N/A"}</div>
                      </div>
                      <div className="mec-no">#{idx + 1}</div>
                    </div>
                    <div className="mec-body">
                      <div className="mec-role">
                        {emp.jabatan ? (
                          <span style={{ fontWeight: 600, color: emp.jabatan === "DOSEN" ? "#3b82f6" : "#10b981", fontSize: "13px" }}>
                            {emp.jabatan.charAt(0).toUpperCase() + emp.jabatan.slice(1).toLowerCase()}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "13px" }}>Belum Diatur</span>
                        )}
                      </div>
                      <div className="mec-action">
                        {emp.jabatan ? (
                          <button onClick={() => handleEditClick(emp)} className="mec-btn mec-btn-edit">
                            Edit Jabatan
                          </button>
                        ) : (
                          <button onClick={() => handleEditClick(emp)} className="mec-btn mec-btn-set">
                            Atur Jabatan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Edit/Map Jabatan */}
      {modalOpen && selectedEmp && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: "420px" }}>
            <div className="modal-header" style={{ padding: "18px 24px 12px 24px", borderBottom: "none" }}>
              <h3 className="modal-title" style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                Atur Jabatan Pengguna
              </h3>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleModalSubmit}>
              <div className="modal-body" style={{ padding: "0 24px 20px 24px" }}>
                {modalError && (
                  <div style={{ padding: "8px 12px", background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 8, color: "#991b1b", fontSize: 13, marginBottom: 16 }}>
                    {modalError}
                  </div>
                )}
                {/* Box Display Nama User */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px", color: "#64748b" }}>
                  Nama User: <span style={{ fontWeight: 700, color: "#0f172a" }}>{selectedEmp.nama || "N/A"}</span>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.5px", marginBottom: "8px" }}>
                    JABATAN (ROLE)
                  </label>
                  <select
                    className="form-input"
                    value={formJabatan}
                    onChange={(e) => setFormJabatan(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", color: "#334155", background: "#fff", cursor: "pointer" }}
                  >
                    <option value="KARYAWAN">Karyawan</option>
                    <option value="DOSEN">Dosen</option>
                  </select>
                </div>

                {formJabatan === "DOSEN" && (
                  <div className="form-group" style={{ marginBottom: 0, marginTop: "16px" }}>
                    <label className="form-label" style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.5px", marginBottom: "8px" }}>
                      JADWAL (SHIFT)
                    </label>
                    <select
                      className="form-input"
                      value={formShift}
                      onChange={(e) => setFormShift(e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", color: "#334155", background: "#fff", cursor: "pointer" }}
                    >
                      <option value={2}>Pagi</option>
                      <option value={3}>Malam</option>
                      <option value={4}>Keduanya (Pagi & Malam)</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ borderTop: "none", padding: "12px 24px 24px 24px", display: "flex", justifyContent: "flex-end", gap: 12, background: "transparent" }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setModalOpen(false)}
                  disabled={modalLoading}
                  style={{ padding: "8px 20px", fontSize: "13px", fontWeight: 600, borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#475569", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={modalLoading}
                  style={{ padding: "8px 24px", fontSize: "13px", fontWeight: 600, borderRadius: "8px", border: "none", background: "#1d4ed8", color: "#fff", cursor: modalLoading ? "not-allowed" : "pointer" }}
                >
                  {modalLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
