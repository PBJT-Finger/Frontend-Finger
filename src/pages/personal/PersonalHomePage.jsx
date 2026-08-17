import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import dayjs from "dayjs";
import PersonalHeader from "./components/PersonalHeader";
import PersonalProfileCard from "./components/PersonalProfileCard";
import PersonalStats from "./components/PersonalStats";
import PersonalTodayCard from "./components/PersonalTodayCard";
import PersonalHistorySection from "./components/PersonalHistorySection";
import "../../styles/personal.css";

const BASE_URL =
  process.env.REACT_APP_API_URL || "https://finger-be.pbjt.web.id/api";
const REFRESH_INTERVAL_MS = 60000;

export default function PersonalHomePage() {
  const navigate = useNavigate();
  // Get context from PersonalLayout, which passes: { sidebarOpen, setSidebarOpen, user }
  const { user, sidebarOpen, setSidebarOpen } = useOutletContext();

  const [summary, setSummary] = useState({ hadir: 0, terlambat: 0, total: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchPersonalData(token);

    // Buka koneksi SSE untuk Real-time updates
    const sseUrl = `${BASE_URL}/device/stream`;
    const source = new EventSource(sseUrl);
    let debounceTimer = null;

    source.onopen = () => {
      console.log("[SSE Personal] Connected for real-time updates");
    };

    source.addEventListener("attendance", (event) => {
      try {
        const data = JSON.parse(event.data);
        const newRecords = data.records || [];
        
        // Kita tidak bisa cek user_id secara pasti karena data absensi dari mesin mungkin anonim sebelum diproses, 
        // tapi kita bisa refetch setiap kali ada event absensi (di-debounce 2 detik agar tidak spam)
        if (newRecords.length > 0) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            console.log("[SSE Personal] New attendance detected, refetching personal data...");
            fetchPersonalData(token);
          }, 2000);
        }
      } catch (err) {
        console.error("[SSE Personal] Failed to parse event:", err);
      }
    });

    source.onerror = () => {
      console.log("[SSE Personal] Connection error. Reconnecting...");
      // Browser EventSource otomatis reconnect, tapi kita pastikan fallback aman
    };

    return () => {
      source.close();
      clearTimeout(debounceTimer);
    };
  }, [navigate]);

  const fetchPersonalData = async (token) => {
    try {
      const [sumRes, histRes] = await Promise.all([
        fetch(`${BASE_URL}/personal/me/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/personal/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (sumRes.ok) {
        const data = await sumRes.json();
        setSummary(data.data);
      }

      if (histRes.ok) {
        const data = await histRes.json();
        setHistory(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      console.error("Gagal mengambil data personal:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pd-loading-container">
        <div className="pd-spinner"></div>
      </div>
    );
  }

  // Find today's attendance record
  const todayStr = dayjs().format("YYYY-MM-DD");
  const todayRecord = history.find(
    (h) => dayjs(h.tanggal).format("YYYY-MM-DD") === todayStr
  );

  return (
    <div className="pd-container">
      <PersonalHeader
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="pd-main">
        <PersonalProfileCard user={user} />
        <PersonalStats summary={summary} />
        <PersonalTodayCard user={user} todayRecord={todayRecord} />
        <PersonalHistorySection history={history} />
      </main>
    </div>
  );
}
