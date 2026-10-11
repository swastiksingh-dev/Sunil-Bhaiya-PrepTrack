/** Registers /sw.js on production http(s) only — never on file://
 * (CORS null-origin) and never on localhost/dev: the SW cache-firsts
 * /_next/static chunks, which would pin stale Turbopack output and break
 * hot reload (stale chunks resolving deleted modules = invalid lazy element). */
"use client";

import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (window.location.protocol !== "http:" && window.location.protocol !== "https:") return;
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      // Dev: remove any previously installed worker so stale cached chunks
      // can never shadow Turbopack output.
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister().catch(() => {}))).catch(() => {});
      return;
    }
    if (process.env.NODE_ENV !== "production") return;
    window.addEventListener("load", () => {
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      navigator.serviceWorker.register(`${base}/sw.js`).catch(() => {});
    });
  }, []);
  return null;
}
