"use client";

import { useEffect } from "react";

export function PwaRegistry() {
  useEffect(() => {
    if ("serviceWorker" in navigator && typeof window !== "undefined") {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("PWA Service Worker registered:", registration.scope);
          },
          (err) => {
            console.error("PWA Service Worker registration failed:", err);
          }
        );
      });
    }
  }, []);

  return null;
}
