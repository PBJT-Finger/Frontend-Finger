import React, { useState, useEffect } from "react";
import { LogOut, Calendar, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import pushService from "../services/pushService";
import "../styles/personal.css";

function PersonalDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({ hadir: 0, terlambat: 0, total: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    // Perbaikan Bug 403: Ambil token langsung dari localStorage, bukan dari objek user yang tidak punya .token
    const token = localStorage.getItem("token");

    // Auto subscribe push if possible, but also give a manual button
    if (token) {
      if (Notification.permission === 'granted') {
        setPushEnabled(true);
      }
    }

    if (token) {
      fetchPersonalData(token);
    } else {
      // Jika tidak ada token (belum login), kembalikan ke halaman login
      navigate("/login");
    }
  }, [navigate]);

  const fetchPersonalData = async (token) => {
    try {
      const BASE_URL = process.env.REACT_APP_API_URL || "https://finger-be.pbjt.web.id/api";
      
      const [sumRes, histRes] = await Promise.all([
        fetch(`${BASE_URL}/personal/me/summary`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/personal/me`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (sumRes.ok) {
        const data = await sumRes.json();
        setSummary(data.data);
      } else {
        console.error("Gagal get summary", sumRes.status);
      }

      if (histRes.ok) {
        const data = await histRes.json();
        setHistory(data.data);
      } else {
        console.error("Gagal get history", histRes.status);
      }
    } catch (err) {
      console.error("Gagal mengambil data personal", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const enablePush = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const success = await pushService.subscribeToPush(token);
      setPushEnabled(success);
      if (success) {
        alert("Notifikasi pengingat berhasil diaktifkan!");
      } else {
        alert("Gagal mengaktifkan notifikasi. Pastikan Anda memberikan izin di browser.");
      }
    }
  };

  if (loading) {
    return (
      <div className="pd-loading-container">
        <div className="pd-spinner"></div>
      </div>
    );
  }

  return (
    <div className="pd-container">
      {/* Header Minimalis Premium */}
      <header className="pd-header">
        <div className="pd-header-top">
          <div className="pd-greeting">
            <h1 className="pd-title">Halo, {user?.name || "Karyawan"}</h1>
            <span className="pd-role">{user?.role || "DOSEN"}</span>
          </div>
          <button onClick={handleLogout} className="pd-logout-btn" aria-label="Logout">
            <LogOut size={20} />
          </button>
        </div>

        {/* Info Ringkas */}
        <div className="pd-stats-container">
          <div className="pd-stat-card">
            <p className="pd-stat-label">Hadir (Bulan Ini)</p>
            <p className="pd-stat-value">{summary.hadir}</p>
          </div>
          <div className="pd-stat-card">
            <p className="pd-stat-label">Terlambat</p>
            <p className="pd-stat-value">{summary.terlambat}</p>
          </div>
        </div>
      </header>

      <main className="pd-main">
        {/* Fitur Pengingat */}
        <div className="pd-feature-card">
          <div className="pd-feature-info">
            <h3 className="pd-feature-title">Pengingat Absen</h3>
            <p className="pd-feature-desc">Terima notifikasi di HP Anda</p>
          </div>
          <button 
            onClick={enablePush}
            disabled={pushEnabled}
            className={`pd-feature-btn ${pushEnabled ? 'active' : 'inactive'}`}
          >
            {pushEnabled ? 'Aktif' : 'Aktifkan'}
          </button>
        </div>

        {/* Riwayat Absen */}
        <div className="pd-history-section">
          <h2 className="pd-section-title">Riwayat Terakhir</h2>
          
          {history.length === 0 ? (
            <div className="pd-empty-state">
              Belum ada data kehadiran bulan ini.
            </div>
          ) : (
            <div className="pd-history-list">
              {history.map((record) => {
                const dateObj = new Date(record.tanggal);
                const isLate = record.status === 'TERLAMBAT';
                
                return (
                  <div key={record.id} className="pd-history-card">
                    <div className="pd-history-left">
                      <div className={`pd-history-icon-wrapper ${isLate ? 'late' : 'ontime'}`}>
                        <Calendar size={20} />
                      </div>
                      <div className="pd-history-details">
                        <p className="pd-history-date">
                          {dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </p>
                        <p className={`pd-history-status ${isLate ? 'late' : 'ontime'}`}>
                          {record.status}
                        </p>
                      </div>
                    </div>
                    <div className="pd-history-right">
                      <p className="pd-history-time">
                        {record.jam_masuk ? record.jam_masuk.substring(11, 16) : '--:--'}
                      </p>
                      <p className="pd-history-type">Masuk</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PersonalDashboard;
