import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

function normalizeBasePath(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "/";
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

const SPA_REDIRECT_STORAGE_KEY = "iquan-spa-redirect";
const basePath = normalizeBasePath(import.meta.env?.BASE_URL || "/");
const pendingRedirect = window.sessionStorage.getItem(SPA_REDIRECT_STORAGE_KEY);

if (pendingRedirect) {
  const currentPath = window.location.pathname;
  if (currentPath === basePath || currentPath === basePath.slice(0, -1) || currentPath === "/") {
    window.sessionStorage.removeItem(SPA_REDIRECT_STORAGE_KEY);
    window.history.replaceState(null, "", pendingRedirect);
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
