import React, { useState, useEffect } from "react";
import pushService from "../../../services/pushService";

export default function PersonalPushFeature() {
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && Notification.permission === 'granted') {
      setPushEnabled(true);
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
  );
}
