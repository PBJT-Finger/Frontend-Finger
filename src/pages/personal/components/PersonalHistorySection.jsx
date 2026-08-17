import React from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import 'dayjs/locale/id';

dayjs.extend(utc);
dayjs.locale('id');

/**
 * Fungsi utilitas untuk memformat field @db.Time(0) dari Prisma.
 * Kolom Time di MySQL dikembalikan sebagai '1970-01-01T07:00:00.000Z' (UTC epoch + waktu).
 * Kita cukup ambil jam dan menit dari objek Date langsung (UTC), karena DB menyimpan
 * waktu lokal namun Prisma memasukannya sebagai UTC epoch.
 */
function formatDbTime(timeValue) {
  if (!timeValue) return '--:--';
  const d = new Date(timeValue);
  if (isNaN(d.getTime())) return '--:--';
  // Ambil jam dan menit UTC (karena Prisma @db.Time menyimpan waktu lokal sebagai UTC epoch)
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${h}.${m}`;
}

export default function PersonalHistorySection({ history }) {
  return (
    <div className="pd-card">
      <div className="pd-card-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        <h3 className="pd-card-title">Riwayat Absensi</h3>
      </div>
      
      {history.length === 0 ? (
        <div className="pd-empty-state">
          Belum ada riwayat absensi.
        </div>
      ) : (
        <div className="pd-table-container">
          <table className="pd-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>TANGGAL</th>
                <th>HARI</th>
                <th>STATUS</th>
                <th>JAM MASUK</th>
                <th>JAM PULANG</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => {
                const isLate = item.status === "TERLAMBAT";
                const dateObj = dayjs(item.tanggal);
                
                return (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{dateObj.format('DD MMMM YYYY')}</td>
                    <td>{dateObj.format('dddd')}</td>
                    <td>
                      <span className={`pd-badge ${isLate ? 'late' : 'ontime'}`}>
                        {isLate ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                        {item.status}
                      </span>
                    </td>
                    <td>{formatDbTime(item.jam_masuk)}</td>
                    <td>{formatDbTime(item.jam_keluar)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
