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
    icon: '/logo192.png',
    badge: '/logo192.png',
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

// Wajib untuk Progressive Web App (PWA) agar dikenali Chrome sebagai "Installable"
self.addEventListener('fetch', function(event) {
  // Biarkan browser menangani fetch seperti biasa (tidak ada offline caching)
  return;
});
