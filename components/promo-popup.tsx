"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X, Gift } from "lucide-react";

import { PromoForm, PromoFormSuccess } from "@/components/promo-form";

const STORAGE_KEY = "promo_dismissed";
const TRIGGER_DELAY_MS = 15_000;

export function PromoPopup() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      }
    }, TRIGGER_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setOpen(nextOpen);
  }

  function handleSuccess() {
    localStorage.setItem(STORAGE_KEY, "true");
    setDone(true);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      {/* Solo montar el portal cuando está abierto: evita el InternalBackdrop full-screen de Base UI
          bloqueando clics en la página cuando el modal está cerrado (bug en algunos navegadores). */}
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
                  source="popup_timer"
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
