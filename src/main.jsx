import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";

// Suppress noisy Google GSI FedCM AbortError (harmless; from their script)
if (typeof window !== "undefined" && import.meta.env.DEV) {
  const origError = console.error;
  console.error = (...args) => {
    const msg = args[0] != null ? String(args[0]) : "";
    if (msg.includes("[GSI_LOGGER]") && msg.includes("FedCM") && msg.includes("AbortError")) return;
    origError.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
