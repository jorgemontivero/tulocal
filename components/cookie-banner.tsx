"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie_consent";
const CONSENT_DAYS = 30;

function isConsentValid(): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts < CONSENT_DAYS * 24 * 60 * 60 * 1000;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isConsentValid()) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-zinc-900 px-4 py-3 shadow-lg sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-4">
        <p className="text-center text-sm leading-relaxed text-zinc-300 sm:text-left">
          Usamos cookies propias y de terceros para mejorar tu experiencia. Al continuar
          navegando, aceptás nuestra{" "}
          <Link
            href="/privacidad"
            className="font-medium text-white underline underline-offset-2 hover:text-emerald-300"
          >
            Política de Privacidad
          </Link>
          .
        </p>
        <Button
          onClick={accept}
          className="shrink-0 bg-emerald-600 px-6 text-white shadow-sm hover:bg-emerald-700"
        >
          Aceptar
        </Button>
      </div>
    </div>
  );
}
