// ==================== PUSH NOTIFICATION SERVICE ====================
// File: src/services/pushService.js

// Public VAPID key harus persis sama dengan yang ada di backend (.env)
const PUBLIC_VAPID_KEY = 'BHnD9KeKptET6-472uU1AR__yfLCxwA0jQkm4L2B4xBgkBhOGN9hsBfFtPAV1NW54_kN4tX834yymZQHOCuSdX4';

// Helper function to convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const pushService = {
  // Mengecek apakah browser mendukung Service Worker & PushManager
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  },

  // Meminta izin dan berlangganan push notification
  async subscribeToPush(token) {
    if (!this.isSupported()) {
      console.warn('Push messaging is not supported in this browser.');
      return false;
    }

    try {
      // 1. Minta Izin Notifikasi
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Izin notifikasi ditolak oleh pengguna.');
        return false;
      }

      // 2. Register Service Worker (jika belum)
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered with scope:', registration.scope);

      // Tunggu hingga Service Worker aktif
      await navigator.serviceWorker.ready;

      // 3. Cek apakah sudah berlangganan
      let subscription = await registration.pushManager.getSubscription();

      // 4. Jika belum, lakukan subscribe ke Push Service browser (FCM/Mozilla Auto)
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
        });
      }

      // 5. Kirim data langganan (subscription) ke backend kita
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3333'}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Sertakan JWT admin
        },
        body: JSON.stringify({ subscription })
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan langganan di server backend');
      }

      console.log('Berhasil berlangganan Push Notifications!');
      return true;
    } catch (error) {
      console.error('Error saat berlangganan Push Notifications:', error);
      return false;
    }
  }
};

export default pushService;
