// ==================== UNIFIED DASHBOARD PAGE ====================
// File: src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Users, Calendar, Clock, LogOut, Home, Menu, X, Cpu, Activity,
  Briefcase, BarChart2, ChevronLeft, ChevronRight, FileText,
  LayoutGrid, Sun, Moon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatsCard from "../components/StatsCard";
import LiveFeedList from "../components/LiveFeedList";
import HourlyBarChart from "../components/HourlyBarChart";
import RekapSection from "../components/RekapSection";
import UserManagement from "../components/UserManagement";
import { getTodayRange, getWeekRange, getMonthRange } from "../utils/dateUtils";
import { getSesiFromTime } from "../utils/timeUtils";
import { apiService } from "../services/apiService";
import { authService } from "../services/authService";
import { useEmployees } from "../hooks/useEmployees";
import { useRekap } from "../hooks/useRekap";
import { useRealtime } from "../hooks/useRealtime";
import "../styles/main.css";

function Dashboard() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 769);
  const [user, setUser] = useState(null);
  const [rekapTab, setRekapTab] = useState("dosen");

  // Custom Hooks
  const {
    employees, employeeLoading, employeeError, empSearch, setEmpSearch,
    empJabatan, setEmpJabatan, unregisteredCount, loadEmployees
  } = useEmployees();

  const {
    activeSession, setActiveSession, searchTerm, setSearchTerm,
    selectedPeriod, setSelectedPeriod, dateRange, setDateRange,
    dosenData, karyawanData, dbStats, tableLoading
  } = useRekap(activeSection, rekapTab);

  const {
    rtTab, setRtTab, rtSession, setRtSession, feedItems, rtStats,
    rtDate, setRtDate, rtLoading
  } = useRealtime(activeSection, dbStats, dosenData, karyawanData);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [formJabatan, setFormJabatan] = useState("KARYAWAN");
  const [formShift, setFormShift] = useState(1);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 769) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (activeSection === "dosen") setRekapTab("dosen");
    if (activeSection === "karyawan") setRekapTab("karyawan");
  }, [activeSection]);

  const handleEditClick = (emp) => {
    setSelectedEmp(emp);
    setFormJabatan(emp.jabatan || "KARYAWAN");
    setFormShift(emp.shift_id || (emp.jabatan === "DOSEN" ? 2 : 1));
    setModalError("");
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");
    try {
      let res;
      if (selectedEmp && selectedEmp.jabatan) {
        res = await apiService.updateEmployee(selectedEmp.user_id, {
          nama: selectedEmp.nama || "",
          jabatan: formJabatan,
          shift_id: formJabatan === "DOSEN" ? parseInt(formShift) : 1
        });
      } else {
        res = await apiService.registerDeviceUser({
          deviceUserId: selectedEmp.user_id,
          nama: selectedEmp.nama || "",
          jabatan: formJabatan,
          shiftId: formJabatan === "DOSEN" ? parseInt(formShift) : 1
        });
      }

      if (res && res.success) {
        setModalOpen(false);
        loadEmployees();
      } else {
        setModalError(res?.message || "Gagal menyimpan perubahan.");
      }
    } catch (err) {
      setModalError(err.message || "Terjadi kesalahan.");
    } finally {
      setModalLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (period === "today") setDateRange(getTodayRange());
    else if (period === "week") setDateRange(getWeekRange());
    else if (period === "month") setDateRange(getMonthRange());
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const filteredDosenData = dosenData.filter((d) => {
    if (activeSession === "all") return true;
    const sesi = d.sesi || getSesiFromTime(d.lastCheckIn);
    return sesi === activeSession;
  });

  const rekapStats = rekapTab === "dosen"
    ? {
      total: filteredDosenData.length,
      hadir: filteredDosenData.reduce((s, d) => s + (d.totalHadir || 0), 0),
      terlambat: filteredDosenData.reduce((s, d) => s + (d.totalTerlambat || 0), 0),
      avgPersentase: filteredDosenData.length > 0
        ? Math.round(filteredDosenData.reduce((s, d) => s + (d.persentase ?? (d.totalHariKerja > 0 ? (d.totalHadir / d.totalHariKerja) * 100 : 0)), 0) / filteredDosenData.length)
        : 0,
    }
    : {
      total: karyawanData.length,
      hadir: karyawanData.reduce((s, k) => s + (k.totalHadir || 0), 0),
      terlambat: 0,
      avgPersentase: karyawanData.length > 0
        ? Math.round(karyawanData.reduce((s, k) => s + (k.persentase ?? (k.totalHariKerja > 0 ? (k.totalHadir / k.totalHariKerja) * 100 : 0)), 0) / karyawanData.length)
        : 0,
    };

  const filteredFeed = feedItems.filter((item) => {
    if (!item.waktu || item.statusAbsen === "tidak_hadir") return false;
    if (rtTab === "dosen" && item.tipe !== "dosen") return false;
    if (rtTab === "karyawan" && item.tipe !== "karyawan") return false;
    if (rtSession !== "all" && item.sesi !== rtSession) return false;
    return true;
  });

  const navItems = [
    { key: "overview", label: "Overview", icon: Home },
    { key: "realtime", label: "Live Realtime", icon: Activity, badge: "LIVE" },
    { key: "dosen", label: "Rekap Dosen", icon: Users },
    { key: "karyawan", label: "Rekap Karyawan", icon: Briefcase },
  ];

  if (user?.role?.toLowerCase() !== "pimpinan") {
    navItems.push({
      key: "fingerprint", label: "Manajemen Pengguna", icon: Cpu,
      badge: unregisteredCount > 0 ? String(unregisteredCount) : null,
      isDangerBadge: true,
    });
  }

  const sectionTitle = {
    overview: "Overview", realtime: "Live Realtime", dosen: "Rekap Dosen",
    karyawan: "Rekap Karyawan", fingerprint: "Manajemen Pengguna",
  }[activeSection];

  return (
    <div className={`dash-shell ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-left">
            <div className="sidebar-brand-icon"><BarChart2 size={20} /></div>
            {sidebarOpen && (
              <div className="sidebar-brand-text">
                <span className="sidebar-brand-title">AbsensiKampus</span>
                <span className="sidebar-brand-sub">Monitoring System</span>
              </div>
            )}
          </div>
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen((o) => !o)} title={sidebarOpen ? "Tutup Menu" : "Buka Menu"}>
            {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
          </button>
          {sidebarOpen && (
            <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)}><X size={15} /></button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ key, label, icon: Icon, badge, isDangerBadge }) => (
            <button key={key} className={`sidebar-nav-item ${activeSection === key ? "active" : ""}`} onClick={() => setActiveSection(key)} title={!sidebarOpen ? label : undefined}>
              <span className="sidebar-nav-icon">
                <Icon size={18} />
                {badge && activeSection !== key && (isDangerBadge ? <span className="sidebar-badge-danger" style={{ position: "absolute", top: -4, right: -4, fontSize: 8, padding: "1px 4px", marginLeft: 0 }}>{badge}</span> : <span className="sidebar-live-dot" />)}
              </span>
              {sidebarOpen && (
                <span className="sidebar-nav-label">
                  {label}
                  {badge && !isDangerBadge && <span className="sidebar-badge">{badge}</span>}
                  {badge && isDangerBadge && <span className="sidebar-badge-danger">{badge}</span>}
                </span>
              )}
              {sidebarOpen && activeSection === key && <ChevronRight size={14} className="sidebar-nav-arrow" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && sidebarOpen && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">{(user.name || user.username || "U").charAt(0).toUpperCase()}</div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.name || user.username || "User"}</span>
                <span className="sidebar-user-email">{user.email || ""}</span>
                {user.role?.toUpperCase() === "PIMPINAN" ? (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "1px 6px", borderRadius: 4, width: "fit-content", marginTop: 4 }}>PIMPINAN</span>
                ) : (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#059669", background: "#d1fae5", padding: "1px 6px", borderRadius: 4, width: "fit-content", marginTop: 4 }}>ADMIN</span>
                )}
              </div>
            </div>
          )}
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <div className="topbar-left">
            <button className="topbar-toggle-btn" onClick={() => setSidebarOpen((o) => !o)}><Menu size={18} /></button>
            <div className="topbar-breadcrumb">
              <span className="topbar-breadcrumb-root">Dashboard</span>
              <ChevronRight size={14} className="topbar-bc-sep" />
              <span className="topbar-breadcrumb-current">{sectionTitle}</span>
            </div>
          </div>
          <div className="topbar-right">
            {activeSection === "realtime" && (
              <div className="topbar-live-badge">
                <span className="rt-pulse-dot" /> REAL-TIME
              </div>
            )}
          </div>
        </header>

        <main className="dash-content">
          {activeSection === "overview" && (
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
                    <button className="overview-card-link" onClick={() => setActiveSection("realtime")}>Lihat semua <ChevronRight size={13} /></button>
                  </div>
                  <LiveFeedList items={feedItems.filter((item) => item.waktu && item.statusAbsen !== "tidak_hadir").slice(0, 8)} loading={rtLoading} compact />
                </div>

                <div className="overview-quick-nav">
                  {[
                    { key: "realtime", icon: Activity, label: "Live Realtime", sub: "Monitor kehadiran saat ini", color: "#8B5CF6" },
                    { key: "dosen", icon: Users, label: "Rekap Dosen", sub: "Data absensi dosen", color: "#3B82F6" },
                    { key: "karyawan", icon: Briefcase, label: "Rekap Karyawan", sub: "Data absensi karyawan", color: "#10B981" },
                  ].map(({ key, icon: Icon, label, sub, color }) => (
                    <button key={key} className="quick-nav-card" onClick={() => setActiveSection(key)}>
                      <span className="quick-nav-icon" style={{ background: color + "20", color }}><Icon size={20} /></span>
                      <span className="quick-nav-text"><span className="quick-nav-label">{label}</span><span className="quick-nav-sub">{sub}</span></span>
                      <ChevronRight size={16} className="quick-nav-arrow" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "realtime" && (
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
                    <h3 className="rt-feed-title"><Activity size={16} color="#1d4ed8" /> Live Feed Kehadiran</h3>
                    <span className="rt-tag">● REAL-TIME</span>
                  </div>

                  <div className="rt-tab-group">
                    {["all", "dosen", "karyawan"].map((t) => (
                      <button key={t} className={`rt-tab ${rtTab === t ? "active" : ""}`} onClick={() => setRtTab(t)}>
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
                    <input type="date" className="filter-input" value={rtDate} onChange={(e) => setRtDate(e.target.value)} style={{ marginBottom: 10, width: "100%" }} />
                    <label className="rt-label">Sesi Kelas</label>
                    <div className="rt-session-pills">
                      {[
                        { key: "all", label: "Semua", Icon: LayoutGrid, cls: "pill-all" },
                        { key: "pagi", label: "Pagi", Icon: Sun, cls: "pill-pagi" },
                        { key: "malam", label: "Malam", Icon: Moon, cls: "pill-malam" },
                      ].map(({ key, label, Icon, cls }) => (
                        <button key={key} className={`rt-pill ${cls} ${rtSession === key ? "active" : ""}`} onClick={() => setRtSession(key)}>
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
          )}

          {activeSection === "dosen" && (
            <RekapSection label="Dosen" stats={rekapStats} filteredData={filteredDosenData} karyawanData={karyawanData} activeSession={activeSession} onSessionChange={setActiveSession} selectedPeriod={selectedPeriod} dateRange={dateRange} onDateRangeChange={setDateRange} onPeriodChange={handlePeriodChange} searchTerm={searchTerm} onSearchChange={setSearchTerm} loading={tableLoading} rekapTab={rekapTab} />
          )}

          {activeSection === "karyawan" && (
            <RekapSection label="Karyawan" stats={rekapStats} filteredData={filteredDosenData} karyawanData={karyawanData} activeSession={activeSession} onSessionChange={setActiveSession} selectedPeriod={selectedPeriod} dateRange={dateRange} onDateRangeChange={setDateRange} onPeriodChange={handlePeriodChange} searchTerm={searchTerm} onSearchChange={setSearchTerm} loading={tableLoading} rekapTab={rekapTab} />
          )}

          {activeSection === "fingerprint" && (
            <UserManagement employees={employees} empSearch={empSearch} setEmpSearch={setEmpSearch} empJabatan={empJabatan} setEmpJabatan={setEmpJabatan} employeeLoading={employeeLoading} loadEmployees={loadEmployees} employeeError={employeeError} handleEditClick={handleEditClick} modalOpen={modalOpen} setModalOpen={setModalOpen} selectedEmp={selectedEmp} formJabatan={formJabatan} setFormJabatan={setFormJabatan} formShift={formShift} setFormShift={setFormShift} handleModalSubmit={handleModalSubmit} modalLoading={modalLoading} modalError={modalError} />
          )}
        </main>
      </div>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}

export default Dashboard;
