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
// PWA: Tangkap beforeinstallprompt SEBELUM React render
// Event ini ditembakkan browser sangat awal — jauh sebelum useEffect berjalan.
// Kita simpan ke window.__pwaPrompt agar bisa diakses kapan saja oleh hook.
// =========================================================================
window.__pwaPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__pwaPrompt = e;
  // Dispatch custom event agar hook yang sudah mount bisa merespon
  window.dispatchEvent(new CustomEvent('pwa-installable'));
});

// =========================================================================
// PWA: Register Service Worker sedini mungkin
// SW harus aktif agar browser mengenali app sebagai PWA yang bisa di-install.
// =========================================================================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.warn('[SW] Registration failed:', err);
  });
}
