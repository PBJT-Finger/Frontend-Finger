/**
 * Service Worker for Attendance System (PWA & Push Notifications)
 * 
 * Note: No-op fetch handler has been removed per Chromium 89+ guidelines
 * to prevent unnecessary navigation latency overhead.
 */

self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'Attendance System';
  const options = {
    body: data.body || 'Ada pembaruan absen terbaru.',
    icon: '/logo-pbjt.png',
    badge: '/logo-pbjt.png',
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Fokus atau buka aplikasi saat notifikasi diklik
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
