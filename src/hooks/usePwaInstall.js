import { useState, useEffect } from "react";

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Mencegah browser menampilkan prompt default secara otomatis
      e.preventDefault();
      // Menyimpan event agar bisa dipicu nanti dengan tombol kustom
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Tampilkan prompt instalasi PWA
    deferredPrompt.prompt();
    // Tunggu respon pengguna
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    // Reset state setelah prompt selesai
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return { isInstallable, handleInstallClick };
}
