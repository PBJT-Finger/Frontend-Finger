import React from "react";
import RekapSection from "../../components/RekapSection";
import { useRekap } from "../../hooks/useRekap";
import { getSesiFromTime } from "../../utils/timeUtils";
import { getTodayRange, getWeekRange, getMonthRange } from "../../utils/dateUtils";

export default function RekapPage({ type }) {
  // type is either "dosen" or "karyawan"
  const {
    activeSession, setActiveSession, searchTerm, setSearchTerm,
    selectedPeriod, setSelectedPeriod, dateRange, setDateRange,
    dosenData, karyawanData, tableLoading
  } = useRekap(type, type);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (period === "today") setDateRange(getTodayRange());
    else if (period === "week") setDateRange(getWeekRange());
    else if (period === "month") setDateRange(getMonthRange());
  };

  const filteredDosenData = dosenData.filter((d) => {
    if (activeSession === "all") return true;
    const sesi = d.sesi || getSesiFromTime(d.lastCheckIn);
    return sesi === activeSession;
  });

  const rekapStats = type === "dosen"
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

  return (
    <RekapSection
      label={type === "dosen" ? "Dosen" : "Karyawan"}
      stats={rekapStats}
      filteredData={filteredDosenData}
      karyawanData={karyawanData}
      activeSession={activeSession}
      onSessionChange={setActiveSession}
      selectedPeriod={selectedPeriod}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      onPeriodChange={handlePeriodChange}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      loading={tableLoading}
      rekapTab={type}
    />
  );
}
