import React, { useState, useEffect } from "react";
import { Mail, Bell, BellRing, Loader2 } from "lucide-react";
import pushService from "../../../services/pushService";

export default function PersonalProfileCard({ user }) {
  const userName = user?.name || user?.username || "Nama Karyawan";
  const firstName = userName.split(' ')[0];
  const initials = userName.charAt(0).toUpperCase();
  
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingPush, setLoadingPush] = useState(false);

  useEffect(() => {
    // Cek apakah browser sudah memberikan izin notifikasi secara default
    if ('Notification' in window && Notification.permission === 'granted') {
      setIsSubscribed(true);
    }
  }, []);

  const handleSubscribe = async () => {
    setLoadingPush(true);
    const token = localStorage.getItem("token");
    const success = await pushService.subscribeToPush(token);
    
    if (success) {
      setIsSubscribed(true);
      alert(`Sip! Pengingat kehadiran berhasil diaktifkan untuk Anda, ${firstName}.`);
    } else {
      alert("Gagal mengaktifkan pengingat. Pastikan izin notifikasi browser diizinkan.");
    }
    setLoadingPush(false);
  };
  
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
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
        <div className="pd-profile-right" style={{ marginBottom: 0 }}>
          <Mail size={16} />
          {user?.email || "email@pbjt.ac.id"}
        </div>
        
        {pushService.isSupported() && (
          <button 
            onClick={handleSubscribe} 
            disabled={isSubscribed || loadingPush}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: isSubscribed ? '#f1f5f9' : '#e0e7ff',
              color: isSubscribed ? '#64748b' : '#4338ca',
              fontSize: '13px',
              fontWeight: 600,
              cursor: (isSubscribed || loadingPush) ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isSubscribed ? 'none' : '0 2px 4px rgba(67, 56, 202, 0.1)'
            }}
          >
            {loadingPush ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isSubscribed ? (
              <BellRing size={16} color="#64748b" />
            ) : (
              <Bell size={16} />
            )}
            {isSubscribed ? "Pengingat Aktif" : `Aktifkan Pengingat, ${firstName}`}
          </button>
        )}
      </div>
    </div>
  );
}
