import React, { useState, useEffect } from "react";
import { LogOut, Calendar, Clock, Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import pushService from "../services/pushService";
import "../styles/main.css";

function PersonalDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({ hadir: 0, terlambat: 0, total: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Auto subscribe push if possible, but also give a manual button
    if (currentUser && currentUser.token) {
      if (Notification.permission === 'granted') {
        setPushEnabled(true);
      }
    }

    fetchPersonalData(currentUser?.token);
  }, []);

  const fetchPersonalData = async (token) => {
    try {
      const BASE_URL = process.env.REACT_APP_API_URL || "https://finger-be.pbjt.web.id/api";
      
      const [sumRes, histRes] = await Promise.all([
        fetch(`${BASE_URL}/personal/me/summary`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/personal/me`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (sumRes.ok) {
        const data = await sumRes.json();
        setSummary(data.data);
      }

      if (histRes.ok) {
        const data = await histRes.json();
        setHistory(data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data personal", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const enablePush = async () => {
    if (user && user.token) {
      const success = await pushService.subscribeToPush(user.token);
      setPushEnabled(success);
      if (success) {
        alert("Notifikasi pengingat berhasil diaktifkan!");
      } else {
        alert("Gagal mengaktifkan notifikasi. Pastikan Anda memberikan izin di browser.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center">
      {/* Header Minimalis */}
      <header className="w-full max-w-md bg-emerald-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Halo, {user?.name}</h1>
            <p className="text-emerald-100 text-sm">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="p-2 bg-emerald-700 rounded-full hover:bg-emerald-800 transition">
            <LogOut size={20} />
          </button>
        </div>

        {/* Info Ringkas */}
        <div className="flex space-x-4">
          <div className="flex-1 bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
            <p className="text-emerald-100 text-sm mb-1">Hadir (Bulan Ini)</p>
            <p className="text-3xl font-bold">{summary.hadir}</p>
          </div>
          <div className="flex-1 bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
            <p className="text-emerald-100 text-sm mb-1">Terlambat</p>
            <p className="text-3xl font-bold">{summary.terlambat}</p>
          </div>
        </div>
      </header>

      <main className="w-full max-w-md p-6 flex-1 flex flex-col gap-6">
        {/* Fitur Pengingat */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Pengingat Absen</h3>
            <p className="text-sm text-gray-500">Terima notifikasi di HP Anda</p>
          </div>
          <button 
            onClick={enablePush}
            disabled={pushEnabled}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              pushEnabled 
                ? 'bg-gray-100 text-emerald-600 cursor-not-allowed dark:bg-gray-700' 
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            {pushEnabled ? 'Aktif' : 'Aktifkan'}
          </button>
        </div>

        {/* Riwayat Absen */}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Riwayat Terakhir</h2>
          {history.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">Belum ada data kehadiran.</div>
          ) : (
            <div className="space-y-3">
              {history.map((record) => {
                const dateObj = new Date(record.tanggal);
                const isLate = record.status === 'TERLAMBAT';
                return (
                  <div key={record.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${isLate ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </p>
                        <p className={`text-xs font-medium ${isLate ? 'text-orange-500' : 'text-emerald-500'}`}>
                          {record.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {record.jam_masuk ? record.jam_masuk.substring(11, 16) : '--:--'}
                      </p>
                      <p className="text-xs text-gray-500">Masuk</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PersonalDashboard;
