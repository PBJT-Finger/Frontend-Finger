import React from "react";
import { Calendar } from "lucide-react";

export default function PersonalHistorySection({ history }) {
  return (
    <div className="pd-history-section">
      <h2 className="pd-section-title">Riwayat Terakhir</h2>
      
      {(!history || history.length === 0) ? (
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
  );
}
