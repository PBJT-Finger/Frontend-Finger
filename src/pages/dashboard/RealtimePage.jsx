import React from "react";
import { Users, Calendar, Clock, FileText, Activity, LayoutGrid, Sun, Moon } from "lucide-react";
import StatsCard from "../../components/StatsCard";
import LiveFeedList from "../../components/LiveFeedList";
import HourlyBarChart from "../../components/HourlyBarChart";
import { useRekap } from "../../hooks/useRekap";
import { useRealtime } from "../../hooks/useRealtime";

export default function RealtimePage() {
  const { dbStats, dosenData, karyawanData } = useRekap("realtime", "dosen");
  const {
    rtTab, setRtTab, rtSession, setRtSession, feedItems, rtStats,
    rtDate, setRtDate, rtLoading
  } = useRealtime("realtime", dbStats, dosenData, karyawanData);

  const filteredFeed = feedItems.filter((item) => {
    if (!item.waktu || item.statusAbsen === "tidak_hadir") return false;
    if (rtTab === "dosen" && item.tipe !== "dosen") return false;
    if (rtTab === "karyawan" && item.tipe !== "karyawan") return false;
    if (rtSession !== "all" && item.sesi !== rtSession) return false;
    return true;
  });

  return (
    <div className="section-realtime">
      <div className="page-heading">
        <h2 className="page-title">Live Realtime</h2>
        <p className="page-sub">Diperbarui otomatis setiap 15 detik</p>
      </div>

      <div className="stats-grid">
        <StatsCard icon={Users} title="Total Dosen & Karyawan" value={rtStats.total} color="#3B82F6" />
        <StatsCard icon={Calendar} title="Total Kehadiran" value={rtStats.hadir} color="#10B981" />
        <StatsCard icon={Clock} title="Keterlambatan" value={rtStats.terlambat} color="#EF4444" />
        <StatsCard icon={FileText} title="Rata-rata Kehadiran" value={`${rtStats.avgPersentase}%`} color="#8B5CF6" />
      </div>

      <div className="rt-main-row">
        <div className="rt-feed-card">
          <div className="rt-feed-header">
            <h3 className="rt-feed-title">
              <Activity size={16} color="#1d4ed8" /> Live Feed Kehadiran
            </h3>
            <span className="rt-tag">● REAL-TIME</span>
          </div>

          <div className="rt-tab-group">
            {["all", "dosen", "karyawan"].map((t) => (
              <button
                key={t}
                className={`rt-tab ${rtTab === t ? "active" : ""}`}
                onClick={() => setRtTab(t)}
              >
                {t === "all" ? "Semua" : t === "dosen" ? "Dosen" : "Karyawan"}
              </button>
            ))}
          </div>
          <LiveFeedList items={filteredFeed} loading={rtLoading} />
        </div>

        <div className="rt-side-panel">
          <div className="rt-side-card">
            <p className="rt-side-title">Periode &amp; Sesi</p>
            <label className="rt-label">Tanggal</label>
            <input
              type="date"
              className="filter-input"
              value={rtDate}
              onChange={(e) => setRtDate(e.target.value)}
              style={{ marginBottom: 10, width: "100%" }}
            />
            <label className="rt-label">Sesi Kelas</label>
            <div className="rt-session-pills">
              {[
                { key: "all", label: "Semua", Icon: LayoutGrid, cls: "pill-all" },
                { key: "pagi", label: "Pagi", Icon: Sun, cls: "pill-pagi" },
                { key: "malam", label: "Malam", Icon: Moon, cls: "pill-malam" },
              ].map(({ key, label, Icon, cls }) => (
                <button
                  key={key}
                  className={`rt-pill ${cls} ${rtSession === key ? "active" : ""}`}
                  onClick={() => setRtSession(key)}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          </div>
          <div className="rt-side-card rt-chart-card">
            <p className="rt-side-title">📊 Kehadiran Per Jam</p>
            <HourlyBarChart items={feedItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
