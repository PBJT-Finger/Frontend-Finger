import React from "react";
import { Users, Calendar, Clock, FileText, Search } from "lucide-react";
import StatsCard from "./StatsCard";
import FilterPanel from "./FilterPanel";
import DosenTable from "./DosenTable";
import KaryawanTable from "./KaryawanTable";

function RekapSection({
  label,
  stats,
  filteredData,
  karyawanData,
  activeSession,
  onSessionChange,
  selectedPeriod,
  dateRange,
  onDateRangeChange,
  onPeriodChange,
  searchTerm,
  onSearchChange,
  loading,
  rekapTab,
}) {
  const isDosen = rekapTab === "dosen";

  return (
    <div className="section-rekap">
      <div className="page-heading">
        <h2 className="page-title">Rekap {label}</h2>
        <p className="page-sub">
          Data kehadiran {label.toLowerCase()} berdasarkan periode yang dipilih
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatsCard
          icon={Users}
          title={`Total ${label}`}
          value={stats.total}
          color="#3B82F6"
        />
        <StatsCard
          icon={Calendar}
          title="Total Kehadiran"
          value={stats.hadir}
          color="#10B981"
        />
        {/* Hanya tampilkan Keterlambatan untuk Dosen, bukan Karyawan */}
        {isDosen && (
          <StatsCard
            icon={Clock}
            title="Total Keterlambatan"
            value={stats.terlambat}
            color="#EF4444"
          />
        )}
        <StatsCard
          icon={FileText}
          title="Rata-rata Kehadiran"
          value={`${stats.avgPersentase}%`}
          color="#8B5CF6"
        />
      </div>

      {/* Filter Panel */}
      <FilterPanel
        activeTab={rekapTab}
        activeSession={activeSession}
        onSessionChange={onSessionChange}
        selectedPeriod={selectedPeriod}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        onPeriodChange={onPeriodChange}
      />

      {/* Search */}
      <div className="search-container">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder={`Cari nama ${label.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <div className="loading-text">Memuat data...</div>
          </div>
        ) : isDosen ? (
          <DosenTable
            data={filteredData}
            searchTerm={searchTerm}
          />
        ) : (
          <KaryawanTable
            data={karyawanData}
            searchTerm={searchTerm}
          />
        )}
      </div>
    </div>
  );
}

export default RekapSection;
