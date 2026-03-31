import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";

// Suppress noisy Google GSI DEV-only logs.
if (typeof window !== "undefined" && import.meta.env.DEV) {
  const shouldSuppressGsiNoise = (args) => {
    const msg = args[0] != null ? String(args[0]) : "";
    const isGsi = msg.includes("[GSI_LOGGER]");

    // React StrictMode remount can trigger duplicate initialize logs.
    if (isGsi && msg.includes("google.accounts.id.initialize() is called multiple times")) {
      return true;
    }

    // Harmless FedCM abort noise from Google script.
    if (isGsi && msg.includes("FedCM") && msg.includes("AbortError")) {
      return true;
    }

    // Keep real issues visible (e.g. origin not allowed / 403).
    return false;
  };

  const origError = console.error;
  const origWarn = console.warn;
  const origLog = console.log;

  console.error = (...args) => {
    if (shouldSuppressGsiNoise(args)) return;
    origError.apply(console, args);
  };

  console.warn = (...args) => {
    if (shouldSuppressGsiNoise(args)) return;
    origWarn.apply(console, args);
  };

  console.log = (...args) => {
    if (shouldSuppressGsiNoise(args)) return;
    origLog.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
