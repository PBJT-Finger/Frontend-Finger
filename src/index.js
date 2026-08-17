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
// PWA Support / Service Worker
// =========================================================================
// Service Worker akan di-register oleh pushService.js.
// Kita hapus kode unregister agresif di sini agar PWA dapat terinstall.
