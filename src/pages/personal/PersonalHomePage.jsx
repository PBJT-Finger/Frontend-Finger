import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import "../../styles/personal.css";
import StatsCard from "../../components/StatsCard";
import { Users, Clock, Calendar } from "lucide-react";

export default function PersonalHomePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ hadir: 0, terlambat: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    let intervalId;
    if (token) {
      fetchPersonalData(token);
      
      // Auto refresh every 60 seconds
      intervalId = setInterval(() => {
        fetchPersonalData(token);
      }, 60000);
    } else {
      navigate("/login");
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [navigate]);

  const fetchPersonalData = async (token) => {
    try {
      const BASE_URL = process.env.REACT_APP_API_URL || "https://finger-be.pbjt.web.id/api";
      const sumRes = await fetch(`${BASE_URL}/personal/me/summary`, { headers: { Authorization: `Bearer ${token}` } });
      if (sumRes.ok) {
        const data = await sumRes.json();
        setSummary(data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data summary", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pd-loading-container" style={{ background: 'transparent', minHeight: '300px' }}>
        <div className="pd-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <h2 className="page-title">Ringkasan Bulan Ini</h2>
        <p className="page-sub">Pantau kehadiran dan kedisiplinan Anda</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <StatsCard icon={Calendar} title="Hadir (Bulan Ini)" value={summary.hadir} color="#3B82F6" />
        <StatsCard icon={Clock} title="Terlambat" value={summary.terlambat} color="#F97316" />
      </div>

      <div className="pd-history-section" style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #f1f5f9" }}>
         <h2 className="pd-section-title">Aksi Cepat</h2>
         <div style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap" }}>
             <button
               onClick={() => navigate("/my-dashboard/riwayat")}
               className="pd-feature-btn inactive"
               style={{ flex: 1, minWidth: "150px" }}
             >
               Lihat Riwayat Absen
             </button>
             <button
               onClick={() => navigate("/my-dashboard/pengaturan")}
               className="pd-feature-btn inactive"
               style={{ flex: 1, minWidth: "150px", backgroundColor: "#f1f5f9", color: "#1e293b" }}
             >
               Pengaturan Notifikasi
             </button>
         </div>
      </div>
    </div>
  );
}
