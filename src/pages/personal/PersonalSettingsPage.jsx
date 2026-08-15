import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import pushService from "../../services/pushService";
import "../../styles/personal.css";

export default function PersonalSettingsPage() {
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      if (Notification.permission === 'granted') {
        setPushEnabled(true);
      }
    }
  }, []);

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

  return (
    <div className="pd-history-section" style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #f1f5f9" }}>
      <h2 className="pd-section-title">Pengaturan</h2>
      
      <div className="pd-feature-card" style={{ marginTop: 16 }}>
        <div className="pd-feature-info">
          <h3 className="pd-feature-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={18} color="#1d4ed8" /> Pengingat Absen
          </h3>
          <p className="pd-feature-desc">Terima notifikasi di HP Anda saat berhasil absen</p>
        </div>
        <button 
          onClick={enablePush}
          disabled={pushEnabled}
          className={`pd-feature-btn ${pushEnabled ? 'active' : 'inactive'}`}
        >
          {pushEnabled ? 'Aktif' : 'Aktifkan'}
        </button>
      </div>
    </div>
  );
}
