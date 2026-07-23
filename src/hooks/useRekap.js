import { useState, useCallback, useEffect } from "react";
import { apiService } from "../services/apiService";
import { getTodayRange } from "../utils/dateUtils";

export function useRekap(activeSection, rekapTab) {
  const [activeSession, setActiveSession] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [dateRange, setDateRange] = useState(getTodayRange());
  const [dosenData, setDosenData] = useState([]);
  const [karyawanData, setKaryawanData] = useState([]);
  const [dbStats, setDbStats] = useState({
    totalEmployees: 0,
    totalDosen: 0,
    totalKaryawan: 0,
  });
  const [tableLoading, setTableLoading] = useState(false);

  const loadRekapData = useCallback(async () => {
    setTableLoading(true);
    try {
      if (activeSection === "overview") {
        const [dosen, karyawan] = await Promise.all([
          apiService.fetchDosenAttendance(dateRange.start, dateRange.end),
          apiService.fetchKaryawanAttendance(dateRange.start, dateRange.end),
        ]);
        setDosenData(dosen || []);
        setKaryawanData(karyawan || []);
      } else if (rekapTab === "dosen") {
        const data = await apiService.fetchDosenAttendance(
          dateRange.start,
          dateRange.end,
        );
        setDosenData(data || []);
      } else {
        const data = await apiService.fetchKaryawanAttendance(
          dateRange.start,
          dateRange.end,
        );
        setKaryawanData(data || []);
      }
    } catch (error) {
      console.error("Error loading rekap data:", error);
    } finally {
      setTableLoading(false);
    }
  }, [rekapTab, dateRange, activeSection]);

  const loadDashboardSummary = useCallback(async () => {
    try {
      const res = await apiService.fetchDashboardSummary();
      if (res && res.data) {
        const d = res.data;
        const tDosen = d.stats?.total?.dosen || d.statistics?.total?.dosen || d.breakdown_jabatan?.dosen || d.dosenCount || 0;
        const tKaryawan = d.stats?.total?.karyawan || d.statistics?.total?.karyawan || d.breakdown_jabatan?.karyawan || d.karyawanCount || 0;
        const tEmps = d.stats?.total?.employees || d.statistics?.total?.employees || (tDosen + tKaryawan) || 0;

        setDbStats({
          totalEmployees: tEmps,
          totalDosen: tDosen,
          totalKaryawan: tKaryawan,
        });
      }
    } catch (error) {
      console.error("Error loading dashboard summary:", error);
    }
  }, []);

  useEffect(() => {
    if (
      activeSection === "dosen" ||
      activeSection === "karyawan" ||
      activeSection === "overview" ||
      activeSection === "realtime"
    ) {
      loadRekapData();
      loadDashboardSummary();
    }
  }, [loadRekapData, loadDashboardSummary, activeSection]);

  useEffect(() => {
    if (rekapTab === "karyawan") setActiveSession("all");
  }, [rekapTab]);

  return {
    activeSession,
    setActiveSession,
    searchTerm,
    setSearchTerm,
    selectedPeriod,
    setSelectedPeriod,
    dateRange,
    setDateRange,
    dosenData,
    karyawanData,
    dbStats,
    tableLoading,
    loadRekapData,
    loadDashboardSummary,
  };
}
