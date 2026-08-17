import React from "react";
import { CheckCircle2, Clock, XCircle, BarChart3 } from "lucide-react";

export default function PersonalStats({ summary }) {
  const hadir = summary?.hadir || 0;
  const terlambat = summary?.terlambat || 0;
  
  // Simulasi data yang belum ada di API untuk keperluan UI
  const totalHariKerja = 22; 
  const tidakHadir = totalHariKerja - (hadir + terlambat) > 0 ? totalHariKerja - (hadir + terlambat) : 0; 
  const totalHadir = hadir + terlambat;
  const persentase = totalHariKerja > 0 ? Math.round((totalHadir / totalHariKerja) * 100) : 0;

  return (
    <div className="pd-stats-grid">
      <div className="pd-card pd-stat-box">
        <div className="pd-stat-icon green">
          <CheckCircle2 size={24} />
        </div>
        <div className="pd-stat-data">
          <p className="pd-stat-label">Total Hadir</p>
          <p className="pd-stat-value">{hadir}</p>
        </div>
      </div>
      
      <div className="pd-card pd-stat-box">
        <div className="pd-stat-icon red">
          <Clock size={24} />
        </div>
        <div className="pd-stat-data">
          <p className="pd-stat-label">Terlambat</p>
          <p className="pd-stat-value">{terlambat}</p>
        </div>
      </div>

      <div className="pd-card pd-stat-box">
        <div className="pd-stat-icon yellow">
          <XCircle size={24} />
        </div>
        <div className="pd-stat-data">
          <p className="pd-stat-label">Tidak Hadir</p>
          <p className="pd-stat-value">{tidakHadir}</p>
        </div>
      </div>

      <div className="pd-card pd-stat-box">
        <div className="pd-stat-icon blue">
          <BarChart3 size={24} />
        </div>
        <div className="pd-stat-data">
          <p className="pd-stat-label">Persentase Kehadiran</p>
          <p className="pd-stat-value">{persentase}%</p>
        </div>
      </div>
    </div>
  );
}
