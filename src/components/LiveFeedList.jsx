import React from "react";
import { XCircle } from "lucide-react";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fmtDateTime(str) {
  if (!str) return { time: "—", date: "—" };
  let dateStr = str.replace(" ", "T");
  if (
    !dateStr.includes("Z") &&
    !dateStr.includes("+") &&
    !dateStr.match(/-\d{2}:\d{2}$/)
  ) {
    dateStr += "Z";
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { time: str, date: "" };
  const pad = (n) => String(n).padStart(2, "0");
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  return {
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
    date: `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
  };
}

const STATUS_MAP = {
  masuk: { label: "Absen Masuk", cls: "feed-status-in" },
  keluar: { label: "Absen Pulang", cls: "feed-status-out" },
  tidak_hadir: { label: "Belum Hadir", cls: "feed-status-absent" },
};

const AVATAR_COLORS = [
  ["#dbeafe", "#1d4ed8"],
  ["#dcfce7", "#166534"],
  ["#fef3c7", "#92400e"],
  ["#ede9fe", "#5b21b6"],
  ["#fce7f3", "#9d174d"],
];

function getAvatarColor(name = "") {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

const LiveFeedList = ({ items, loading }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <div className="loading-text">Memuat live feed...</div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="no-data-container">
        <XCircle size={48} className="no-data-icon" />
        <p className="no-data-text">Tidak ada data untuk filter ini</p>
      </div>
    );
  }

  return (
    <div className="rt-feed-list">
      {items.map((item, i) => {
        const { time, date } = fmtDateTime(item.waktu || item.lastCheckIn);
        const status = STATUS_MAP[item.statusAbsen] || STATUS_MAP.tidak_hadir;
        const [bg, fg] = getAvatarColor(item.nama);
        return (
          <div
            key={item.id || i}
            className={`rt-feed-item${i === 0 ? " rt-feed-item--new" : ""}`}
          >
            <div className="rt-avatar" style={{ background: bg, color: fg }}>
              {getInitials(item.nama)}
            </div>
            <div className="rt-feed-info">
              <span className="rt-feed-name">{item.nama || "N/A"}</span>
              <span className="rt-feed-role">
                {item.tipe === "dosen" ? "Dosen" : "Karyawan"}
              </span>
              {/* Primary action badge */}
              <span className={`rt-feed-status ${status.cls}`}>
                {item.statusAbsen === "tidak_hadir" ? "● " : "✓ "}
                {status.label}
              </span>
              {/* Secondary indicator badges */}
              {item.terlambat && item.tipe === "dosen" && item.statusAbsen !== "keluar" && (
                <span className="rt-feed-status feed-status-late">
                  Terlambat
                </span>
              )}
            </div>
            <div className="rt-feed-time">
              <span className="rt-time-val">⏰ {time}</span>
              <span className="rt-date-val">{date}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LiveFeedList;
