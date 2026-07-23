import { useState, useCallback, useEffect, useRef } from "react";
import { apiService } from "../services/apiService";

export function sortFeed(items) {
  return [...items].sort((a, b) => {
    if (a.waktu && !b.waktu) return -1;
    if (!a.waktu && b.waktu) return 1;
    if (a.waktu && b.waktu) {
      return new Date(b.waktu) - new Date(a.waktu);
    }
    return (a.nama || "").localeCompare(b.nama || "");
  });
}

export function useRealtime(activeSection, dbStats, dosenData, karyawanData) {
  const [rtTab, setRtTab] = useState("all");
  const [rtSession, setRtSession] = useState("all");
  const [feedItems, setFeedItems] = useState([]);
  const [rtStats, setRtStats] = useState({
    total: 0,
    hadir: 0,
    terlambat: 0,
    avgPersentase: 0,
  });
  const [rtDate, setRtDate] = useState(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [rtLoading, setRtLoading] = useState(false);
  const pollRef = useRef(null);
  const sseRef = useRef(null);
  const liveDebounceRef = useRef(null);

  // Gunakan ref untuk menyimpan nilai terkini tanpa memicu re-render/re-effect
  const dbStatsRef = useRef(dbStats);
  const dosenDataRef = useRef(dosenData);
  const karyawanDataRef = useRef(karyawanData);
  const rtDateRef = useRef(rtDate);

  // Selalu update ref saat props/state berubah
  useEffect(() => { dbStatsRef.current = dbStats; }, [dbStats]);
  useEffect(() => { dosenDataRef.current = dosenData; }, [dosenData]);
  useEffect(() => { karyawanDataRef.current = karyawanData; }, [karyawanData]);
  useEffect(() => { rtDateRef.current = rtDate; }, [rtDate]);

  // computeRtStats menggunakan ref — tidak perlu masuk dependency array loadFeed
  const computeRtStats = useCallback((data) => {
    const dbStats = dbStatsRef.current;
    const dosenData = dosenDataRef.current;
    const karyawanData = karyawanDataRef.current;

    const presentScans = data.filter(
      (d) => d.waktu && d.statusAbsen !== "tidak_hadir" && d.is_active === true,
    );
    const uniqueHadir = new Set(presentScans.map((d) => d.user_id));
    const hadir = uniqueHadir.size;

    const uniqueTerlambat = new Set(
      presentScans.filter((d) => d.terlambat && d.tipe === "dosen").map((d) => d.user_id),
    );
    const terlambat = uniqueTerlambat.size;

    let total = dbStats.totalEmployees || (dosenData?.length || 0) + (karyawanData?.length || 0);
    if (total === 0) total = Math.max(hadir, 10);

    const avg = total > 0 ? Math.round((hadir / total) * 100) : 0;
    setRtStats({ total, hadir, terlambat, avgPersentase: avg });
  }, []); // ← stable reference, tidak pernah berubah

  // loadFeed hanya bergantung pada rtDate — stable reference kecuali tanggal berubah
  const loadFeed = useCallback(async () => {
    const date = rtDateRef.current;
    try {
      const data = await apiService.fetchRealtimeFeed(date);

      // Deduplikasi: cegah baris duplikat dari DB tampil di feed.
      // Key: user_id + statusAbsen + jam:menit (UTC)
      const seen = new Map();
      const deduped = (data || []).filter((item) => {
        const waktu = item.waktu ? new Date(item.waktu) : null;
        const timeKey = waktu && !isNaN(waktu)
          ? `${waktu.getUTCHours()}:${String(waktu.getUTCMinutes()).padStart(2, "0")}`
          : "null";
        const key = `${item.user_id}_${item.statusAbsen}_${timeKey}`;
        if (seen.has(key)) return false;
        seen.set(key, true);
        return true;
      });

      const sorted = sortFeed(deduped);
      setFeedItems(sorted);
      computeRtStats(sorted);
    } catch (err) {
      console.error("Realtime feed error:", err);
    } finally {
      setRtLoading(false);
    }
  }, [computeRtStats]); // computeRtStats sudah stable → loadFeed juga stable

  // loadFeedRef agar SSE handler selalu pakai versi terbaru tanpa re-subscribe
  const loadFeedRef = useRef(loadFeed);
  useEffect(() => { loadFeedRef.current = loadFeed; }, [loadFeed]);

  useEffect(() => {
    if (activeSection === "realtime" || activeSection === "overview") {
      setRtLoading(true);
      loadFeedRef.current();

      const sseUrl = `${process.env.REACT_APP_API_URL || "https://finger-be.pbjt.web.id/api"}/device/stream`;
      const source = new EventSource(sseUrl);
      sseRef.current = source;

      source.onopen = () => {
        console.log("[SSE] Connection established successfully");
      };

      source.addEventListener("attendance", (event) => {
        try {
          const data = JSON.parse(event.data);
          const newRecords = data.records || [];
          const hasToday = newRecords.some((r) => {
            const datePart = (r.recordTime || "").slice(0, 10);
            return datePart === rtDateRef.current;
          });

          if (hasToday) {
            clearTimeout(liveDebounceRef.current);
            liveDebounceRef.current = setTimeout(() => {
              loadFeedRef.current();
            }, 1500);
          }
        } catch (err) {
          console.error("[SSE] Failed to parse live attendance:", err);
        }
      });

      source.onerror = () => {
        source.close();
        clearInterval(pollRef.current);
        pollRef.current = setInterval(() => loadFeedRef.current(), 15000);
      };
    } else {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
      clearInterval(pollRef.current);
      clearTimeout(liveDebounceRef.current);
    }

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
      clearInterval(pollRef.current);
      clearTimeout(liveDebounceRef.current);
    };
  }, [activeSection, rtDate]); // ← hanya re-run jika section atau tanggal berubah, BUKAN karena loadFeed berubah

  return {
    rtTab,
    setRtTab,
    rtSession,
    setRtSession,
    feedItems,
    rtStats,
    rtDate,
    setRtDate,
    rtLoading,
    loadFeed,
  };
}
