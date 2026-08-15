import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/personal.css";

export default function PersonalRiwayatPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchPersonalHistory(token);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchPersonalHistory = async (token) => {
    try {
      const BASE_URL = process.env.REACT_APP_API_URL || "https://finger-be.pbjt.web.id/api";
      const histRes = await fetch(`${BASE_URL}/personal/me`, { headers: { Authorization: `Bearer ${token}` } });
      
      if (histRes.ok) {
        const data = await histRes.json();
        setHistory(data.data);
      }
    } catch (err) {
      console.error("Gagal get history", err);
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
    <div className="pd-history-section">
      <h2 className="pd-section-title">Riwayat Kehadiran Terakhir</h2>
      
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
  );
}
