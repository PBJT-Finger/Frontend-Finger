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
    const intervalId = setInterval(() => fetchPersonalData(token), REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
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
