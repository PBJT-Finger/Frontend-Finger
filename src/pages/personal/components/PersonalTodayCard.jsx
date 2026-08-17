import React from "react";
import { Calendar, Info } from "lucide-react";
import dayjs from "dayjs";

export default function PersonalTodayCard({ user, todayRecord }) {
  // Prisma @db.Time(0) dikembalikan sebagai 1970-01-01T{HH:mm:ss}.000Z
  // Harus pakai getUTCHours/getUTCMinutes karena DB menyimpan waktu lokal sebagai UTC epoch
  const formatDbTime = (val) => {
    if (!val) return '--:--';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '--:--';
    const h = String(d.getUTCHours()).padStart(2, '0');
    const m = String(d.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const jamMasuk = formatDbTime(todayRecord?.jam_masuk);
  const jamPulang = formatDbTime(todayRecord?.jam_keluar);
  const userName = user?.name || user?.username || "-";

  return (
    <div className="pd-middle-grid">
      <div className="pd-card">
        <div className="pd-card-header">
          <Calendar size={18} color="#64748b" />
          <h3 className="pd-card-title">Kehadiran Hari Ini</h3>
        </div>
        
        {!todayRecord && (
          <div className="pd-badge-sm">Belum ada data</div>
        )}
        
        <div className="pd-today-boxes">
          <div className="pd-time-box">
            <p className="pd-time-label">Jam Masuk</p>
            <p className="pd-time-value">{jamMasuk}</p>
          </div>
          <div className="pd-time-box">
            <p className="pd-time-label">Jam Pulang</p>
            <p className="pd-time-value">{jamPulang}</p>
          </div>
        </div>
      </div>

      <div className="pd-card">
        <div className="pd-card-header">
          <Info size={18} color="#64748b" />
          <h3 className="pd-card-title">Informasi Akun</h3>
        </div>
        <div className="pd-info-list">
          <div className="pd-info-item">
            <span className="pd-info-label">Nama</span>
            <span className="pd-info-value">{userName}</span>
          </div>
          <div className="pd-info-item">
            <span className="pd-info-label">Role</span>
            <span className="pd-info-value">{user?.role === 'DOSEN' ? 'Dosen' : 'Karyawan'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
