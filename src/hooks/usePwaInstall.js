import { useState, useEffect } from "react";

/**
 * Hook untuk menangani PWA install prompt.
 *
 * Strategi dua lapis:
 * 1. Cek window.__pwaPrompt (event yang ditangkap SEBELUM React mount di index.js)
 * 2. Dengarkan custom event 'pwa-installable' untuk kasus event tiba SETELAH mount
 *
 * Ini diperlukan karena browser menembakkan 'beforeinstallprompt' sangat awal,
 * jauh sebelum useEffect berjalan, sehingga listener biasa akan selalu terlewat.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(() => {
    // Langsung ambil dari window jika sudah ditangkap sebelum mount
    return window.__pwaPrompt || null;
  });

  const isInstallable = deferredPrompt !== null;

  useEffect(() => {
    // Jika sudah ada dari window (event terjadi sebelum mount), tidak perlu listener lagi
    if (window.__pwaPrompt && !deferredPrompt) {
      setDeferredPrompt(window.__pwaPrompt);
    }

    // Dengarkan custom event untuk kasus event tiba setelah komponen mount
    const handleInstallable = () => {
      if (window.__pwaPrompt) {
        setDeferredPrompt(window.__pwaPrompt);
      }
    };

    window.addEventListener("pwa-installable", handleInstallable);
    return () => {
      window.removeEventListener("pwa-installable", handleInstallable);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("[PWA] User accepted the install prompt");
    } else {
      console.log("[PWA] User dismissed the install prompt");
    }

    // Reset setelah prompt digunakan — prompt hanya bisa dipakai sekali
    window.__pwaPrompt = null;
    setDeferredPrompt(null);
  };

  return { isInstallable, handleInstallClick };
}
