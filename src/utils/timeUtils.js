export function getSesiFromTime(timeStr) {
  if (!timeStr) return null;
  if (timeStr.includes("-") || timeStr.includes("T")) {
    const date = new Date(timeStr.replace(" ", "T"));
    if (!isNaN(date.getTime())) {
      const hour = date.getUTCHours();
      if (hour >= 6 && hour < 15) return "pagi";
      if (hour >= 15 && hour <= 22) return "malam";
    }
  }
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    const hour = parseInt(parts[0], 10);
    if (!isNaN(hour)) {
      if (hour >= 6 && hour < 15) return "pagi";
      if (hour >= 15 && hour <= 22) return "malam";
    }
  }
  return null;
}
