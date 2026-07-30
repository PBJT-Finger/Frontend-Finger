// ==================== API SERVICE ====================
// File: src/services/apiService.js

const BASE_URL =
  process.env.REACT_APP_API_URL || "https://finger-be.pbjt.web.id/api";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

const handleResponse = async (res) => {
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(res.statusText || "API Error");
  return res.json();
};

export const apiService = {
  async fetchAllAttendance(startDate, endDate) {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        limit: 200,
      });
      const res = await fetch(
        `${BASE_URL}/attendance/summary?${params.toString()}`,
        { method: "GET", headers: getAuthHeader() },
      );
      const response = await handleResponse(res);
      return response?.data || [];
    } catch (err) {
      console.error("Error fetching attendance:", err);
      return [];
    }
  },

  async fetchDosenAttendance(startDate, endDate) {
    try {
      const all = await this.fetchAllAttendance(startDate, endDate);
      return all.filter((d) => (d.jabatan || "").toUpperCase() === "DOSEN");
    } catch (err) {
      console.error("Error fetching dosen attendance:", err);
      return [];
    }
  },

  async fetchKaryawanAttendance(startDate, endDate) {
    try {
      const all = await this.fetchAllAttendance(startDate, endDate);
      return all.filter((d) => (d.jabatan || "").toUpperCase() !== "DOSEN");
    } catch (err) {
      console.error("Error fetching karyawan attendance:", err);
      return [];
    }
  },

  // ==================== REALTIME FEED ====================
  // Memanggil fetchAllAttendance dengan startDate = endDate = date,
  // lalu memetakan field ke format yang dipakai LiveFeedList & HourlyBarChart.
  async fetchRealtimeFeed(date) {
    try {
      const params = new URLSearchParams({
        start_date: date,
        end_date: date,
        limit: 500,
      });
      const res = await fetch(`${BASE_URL}/attendance?${params.toString()}`, {
        method: "GET",
        headers: getAuthHeader(),
      });
      const response = await handleResponse(res);
      const logs = response?.data?.data || [];

      const combineDateTime = (tanggal, timePart) => {
        if (!timePart) return null;
        const dDate = new Date(tanggal);
        const dTime = new Date(timePart);
        return new Date(
          Date.UTC(
            dDate.getUTCFullYear(),
            dDate.getUTCMonth(),
            dDate.getUTCDate(),
            dTime.getUTCHours(),
            dTime.getUTCMinutes(),
            dTime.getUTCSeconds(),
          ),
        ).toISOString();
      };

      return logs.flatMap((row) => {
        const timeStrRef =
          combineDateTime(row.tanggal, row.jam_masuk || row.jam_keluar) ||
          new Date(row.created_at).toISOString();

        const isAfter22 = (timeStr) => {
          if (!timeStr) return false;
          const dt = new Date(timeStr);
          if (isNaN(dt.getTime())) return false;
          const h = dt.getUTCHours();
          return h >= 22 && h < 24;
        };

        const sesi = (() => {
          if (!timeStrRef) return "pagi";
          const dt = new Date(timeStrRef);
          if (!isNaN(dt.getTime())) {
            const h = dt.getUTCHours();
            if (h >= 6 && h < 15) return "pagi";
            if (h >= 15 && h < 22) return "malam";
          }
          return "malam";
        })();

        const results = [];
        const baseId = row.id ? String(row.id) : `${row.user_id}_${sesi}`;
        const tipeVal = (row.jabatan || "").toUpperCase() === "DOSEN" ? "dosen" : "karyawan";

        if (row.jam_masuk || (!row.jam_masuk && !row.jam_keluar)) {
          const timeStrIn = combineDateTime(row.tanggal, row.jam_masuk) || new Date(row.created_at).toISOString();
          if (!isAfter22(timeStrIn)) {
            results.push({
              id: `${baseId}_masuk`,
              user_id: row.user_id,
              nama: row.nama || "N/A",
              tipe: tipeVal,
              statusAbsen: "masuk",
              terlambat: row.status === "TERLAMBAT",
              pulangCepat: row.status_keluar === "PULANG_CEPAT",
              waktu: timeStrIn,
              is_active: row.is_active,
              sesi: sesi,
            });
          }
        }

        if (row.jam_keluar) {
          const timeStrOut = combineDateTime(row.tanggal, row.jam_keluar);
          if (timeStrOut && !isAfter22(timeStrOut)) {
            results.push({
              id: `${baseId}_keluar`,
              user_id: row.user_id,
              nama: row.nama || "N/A",
              tipe: tipeVal,
              statusAbsen: "keluar",
              terlambat: false,
              pulangCepat: row.status_keluar === "PULANG_CEPAT",
              waktu: timeStrOut,
              is_active: row.is_active,
              sesi: sesi,
            });
          }
        }

        return results;
      });
    } catch (err) {
      console.error("Error fetching realtime feed:", err);
      return [];
    }
  },

  // ==================== EXPORT ====================
  async exportData(format, jabatan, startDate, endDate) {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });
      if (jabatan) params.append("jabatan", jabatan.toUpperCase());

      const res = await fetch(
        `${BASE_URL}/export/${format}?${params.toString()}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Session expired");
      }
      if (!res.ok) throw new Error("Export gagal");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const ext = format === "csv" ? "csv" : format === "pdf" ? "pdf" : "xlsx";

      const a = document.createElement("a");
      a.href = url;
      a.download = `rekap-absensi-${jabatan || "all"}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: `Export ${ext.toUpperCase()} berhasil didownload.`,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Export gagal. Silakan coba lagi.");
    }
  },

  // ==================== DEVICE USERS MANAGEMENT ====================
  async fetchDeviceUsers() {
    try {
      const res = await fetch(`${BASE_URL}/device/users/pull`, {
        method: "GET",
        headers: getAuthHeader(),
      });
      const response = await handleResponse(res);
      return (
        response?.data || {
          deviceStatus: "offline",
          totalOnDevice: 0,
          summary: { registered: 0, unregistered: 0, partial: 0 },
          users: [],
        }
      );
    } catch (err) {
      console.error("Error fetching device users:", err);
      return {
        deviceStatus: "offline",
        totalOnDevice: 0,
        summary: { registered: 0, unregistered: 0, partial: 0 },
        users: [],
      };
    }
  },

  async fetchActiveShifts() {
    try {
      const res = await fetch(`${BASE_URL}/device/shifts`, {
        method: "GET",
        headers: getAuthHeader(),
      });
      const response = await handleResponse(res);
      return response?.data || [];
    } catch (err) {
      console.error("Error fetching shifts:", err);
      return [];
    }
  },

  async registerDeviceUser(payload) {
    try {
      const res = await fetch(`${BASE_URL}/device/users/register`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(payload),
      });
      const response = await handleResponse(res);
      return {
        success: true,
        data: response?.data,
        message: response?.message,
      };
    } catch (err) {
      console.error("Error registering device user:", err);
      return {
        success: false,
        message: err.message || "Gagal memetakan user mesin.",
      };
    }
  },

  // ==================== EMPLOYEES MANAGEMENT ====================
  async fetchEmployees(page = 1, limit = 50, search = '', jabatan = '', status = '', is_active = '') {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (jabatan) params.append('jabatan', jabatan);
      if (status) params.append('status', status);
      if (is_active !== '') params.append('is_active', is_active);

      const res = await fetch(`${BASE_URL}/employees?${params.toString()}`, {
        method: "GET",
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error fetching employees:", err);
      throw err;
    }
  },

  async updateEmployee(userId, payload) {
    try {
      const res = await fetch(`${BASE_URL}/employees/${userId}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(payload),
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error updating employee:", err);
      throw err;
    }
  },

  async deleteEmployee(userId) {
    try {
      const res = await fetch(`${BASE_URL}/employees/${userId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error deleting employee:", err);
      throw err;
    }
  },

  // ==================== DASHBOARD SUMMARY ====================
  async fetchDashboardSummary() {
    try {
      const res = await fetch(`${BASE_URL}/dashboard/summary`, {
        method: "GET",
        headers: getAuthHeader(),
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
      throw err;
    }
  },
};
