"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { X, Gift } from "lucide-react";

import { PromoForm, PromoFormSuccess } from "@/components/promo-form";

function PromoFooterModal() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  function handleSuccess() {
    setDone(true);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setDone(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
        <Gift className="size-3.5" />
        Sorteos y Cupones
      </Dialog.Trigger>

      {open ? (
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="relative rounded-t-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <Gift className="size-5 shrink-0" />
                <Dialog.Title className="text-base font-bold leading-tight">
                  Sorteos y cupones exclusivos
                </Dialog.Title>
              </div>
              <Dialog.Description className="mt-1 text-sm text-emerald-100">
                Dejá tus datos y participá por descuentos en comercios de Catamarca.
              </Dialog.Description>
              <Dialog.Close
                className="absolute right-3 top-3 rounded-lg p-1 text-emerald-100 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>

            <div className="p-5">
              {done ? (
                <PromoFormSuccess />
              ) : (
                <PromoForm
                  source="footer_link"
                  onSuccess={handleSuccess}
                />
              )}
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-emerald-900/40 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-white ring-1 ring-inset ring-white/10 dark:border-emerald-400/20 dark:from-emerald-900 dark:via-emerald-950 dark:to-zinc-950 dark:ring-emerald-400/10">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap items-center gap-4">
            <Link className="text-white/90 hover:text-white" href="/">
              Inicio
            </Link>
            <Link className="text-white/90 hover:text-white" href="/precios">
              Precios
            </Link>
            <Link className="text-white/90 hover:text-white" href="/nosotros">
              Nosotros
            </Link>
            <Link className="text-white/90 hover:text-white" href="/contacto">
              Contacto
            </Link>
          </nav>
          <div className="flex justify-center sm:flex-1">
            <PromoFooterModal />
          </div>
          <p className="text-white/90">Potenciando el comercio local</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 text-xs text-white/60">
          <span>© {new Date().getFullYear()} tulocal.com.ar</span>
          <span aria-hidden>·</span>
          <Link href="/terminos">Términos y condiciones</Link>
          <Link href="/privacidad">Política de privacidad</Link>
        </div>
      </div>
    </footer>
  );
}
