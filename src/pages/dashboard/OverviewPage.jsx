import React, { useState, useEffect } from "react";
import { Users, Briefcase, Activity, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatsCard from "../../components/StatsCard";
import LiveFeedList from "../../components/LiveFeedList";
import { authService } from "../../services/authService";
import { useRekap } from "../../hooks/useRekap";
import { useRealtime } from "../../hooks/useRealtime";

export default function OverviewPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Pakai hook untuk data dbStats dan realtime stats
  const { dbStats, dosenData, karyawanData } = useRekap("overview", "dosen");
  const { feedItems, rtStats, rtLoading } = useRealtime("overview", dbStats, dosenData, karyawanData);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  return (
    <div className="section-overview">
      <div className="page-heading">
        <h2 className="page-title">
          {user && (user.name || user.username).toLowerCase() === "pimpinan"
            ? "Selamat Datang Aziz Azindani 👋"
            : `Selamat datang${user ? `, ${user.name || user.username}` : ""} 👋`}
        </h2>
        <p className="page-sub">Ringkasan kehadiran hari ini</p>
      </div>

      <div className="stats-grid">
        <StatsCard icon={Users} title="Total Dosen" value={dbStats.totalDosen} color="#3B82F6" />
        <StatsCard icon={Briefcase} title="Total Karyawan" value={dbStats.totalKaryawan} color="#10B981" />
        <StatsCard icon={Activity} title="Live Check-in" value={rtStats.hadir} color="#8B5CF6" />
        <StatsCard icon={Clock} title="Keterlambatan" value={rtStats.terlambat} color="#EF4444" />
      </div>

      <div className="overview-grid">
        <div className="overview-card">
          <div className="overview-card-header">
            <span className="overview-card-title"><Activity size={15} /> Live Feed Kehadiran</span>
            <button className="overview-card-link" onClick={() => navigate("/dashboard/realtime")}>
              Lihat semua <ChevronRight size={13} />
            </button>
          </div>
          <LiveFeedList
            items={feedItems.filter((item) => item.waktu && item.statusAbsen !== "tidak_hadir").slice(0, 8)}
            loading={rtLoading}
            compact
          />
        </div>

        <div className="overview-quick-nav">
          {[
            { key: "realtime", path: "/dashboard/realtime", icon: Activity, label: "Live Realtime", sub: "Monitor kehadiran saat ini", color: "#8B5CF6" },
            { key: "rekap-dosen", path: "/dashboard/rekap-dosen", icon: Users, label: "Rekap Dosen", sub: "Data absensi dosen", color: "#3B82F6" },
            { key: "rekap-karyawan", path: "/dashboard/rekap-karyawan", icon: Briefcase, label: "Rekap Karyawan", sub: "Data absensi karyawan", color: "#10B981" },
          ].map(({ key, path, icon: Icon, label, sub, color }) => (
            <button key={key} className="quick-nav-card" onClick={() => navigate(path)}>
              <span className="quick-nav-icon" style={{ background: color + "20", color }}>
                <Icon size={20} />
              </span>
              <span className="quick-nav-text">
                <span className="quick-nav-label">{label}</span>
                <span className="quick-nav-sub">{sub}</span>
              </span>
              <ChevronRight size={16} className="quick-nav-arrow" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
