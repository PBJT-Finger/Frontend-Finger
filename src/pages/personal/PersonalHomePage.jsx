import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import { useNavigate, useOutletContext } from "react-router-dom";
import "../../styles/personal.css";
import PersonalHeader from "./components/PersonalHeader";
import PersonalPushFeature from "./components/PersonalPushFeature";
import PersonalHistorySection from "./components/PersonalHistorySection";

import PersonalStats from "./components/PersonalStats";

export default function PersonalHomePage() {
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen, user } = useOutletContext();
  
  const [summary, setSummary] = useState({ hadir: 0, terlambat: 0, total: 0 });
  const [history, setHistory] = useState([]);
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
      
      const [sumRes, histRes] = await Promise.all([
        fetch(`${BASE_URL}/personal/me/summary`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/personal/me`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (sumRes.ok) {
        const data = await sumRes.json();
        setSummary(data.data);
      }
      
      if (histRes.ok) {
        const data = await histRes.json();
        setHistory(data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data personal", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pd-loading-container" style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <div className="pd-spinner"></div>
      </div>
    );
  }

  return (
    <div className="pd-container">
      <PersonalHeader 
        user={user} 
        summary={summary} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      <main className="pd-main">
        <div className="pd-left-column">
          <PersonalStats summary={summary} />
          <PersonalPushFeature />
        </div>
        <div className="pd-right-column">
          <PersonalHistorySection history={history} />
        </div>
      </main>
    </div>
  );
}
