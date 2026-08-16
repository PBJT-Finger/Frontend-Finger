import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/personal.css";
import "./styles/main.css";
import "./styles/layout.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// =========================================================================
// CRITICAL: Aggressive Cache Busting / Service Worker Removal
// =========================================================================
// Jika versi sebelumnya menggunakan PWA/ServiceWorker yang membandel
// dan me-nge-cache index.html, kita harus memaksanya untuk dihapus
// agar pengguna selalu mendapatkan tampilan UI terbaru.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      // Kecuali sw.js untuk push notification, kita unregister semuanya
      // (Bisa juga unregister semua dan biarkan pushService meregister ulang)
      console.log('Unregistering old service worker to clear cache:', registration);
      registration.unregister();
    }
  }).catch((err) => {
    console.error('Error during service worker unregistration:', err);
  });
}
