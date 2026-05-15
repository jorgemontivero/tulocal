"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

type ContactButtonsProps = {
  whatsappUrl: string | null;
  instagramUrl: string | null;
};

export function ContactButtons({ whatsappUrl, instagramUrl }: ContactButtonsProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
  }, []);

  if (!whatsappUrl && !instagramUrl) return null;

  // While auth state is loading, render buttons in a disabled-looking state
  if (isLoggedIn === null) {
    return (
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-end">
        {whatsappUrl && (
          <Button disabled className="bg-emerald-600 text-white opacity-70">
            <MessageCircle />
            WhatsApp
          </Button>
        )}
        {instagramUrl && (
          <Button disabled variant="outline" className="border-fuchsia-500 text-fuchsia-700 opacity-70 dark:border-fuchsia-500/80 dark:text-fuchsia-300">
            <InstagramIcon className="size-4" />
            Instagram
          </Button>
        )}
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-end">
        {whatsappUrl && (
          <Button
            render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <MessageCircle />
            WhatsApp
          </Button>
        )}
        {instagramUrl && (
          <Button
            render={<a href={instagramUrl} target="_blank" rel="noopener noreferrer" />}
            variant="outline"
            className="border-fuchsia-500 text-fuchsia-700 hover:bg-fuchsia-50 dark:border-fuchsia-500/80 dark:text-fuchsia-300 dark:hover:bg-fuchsia-950/30"
          >
            <InstagramIcon className="size-4" />
            Instagram
          </Button>
        )}
      </div>
    );
  }

  // Not logged in: buttons open the register dialog
  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-end">
        {whatsappUrl && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <MessageCircle />
            WhatsApp
          </Button>
        )}
        {instagramUrl && (
          <Button
            onClick={() => setDialogOpen(true)}
            variant="outline"
            className="border-fuchsia-500 text-fuchsia-700 hover:bg-fuchsia-50 dark:border-fuchsia-500/80 dark:text-fuchsia-300 dark:hover:bg-fuchsia-950/30"
          >
            <InstagramIcon className="size-4" />
            Instagram
          </Button>
        )}
      </div>

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        {dialogOpen && (
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
            <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 dark:bg-zinc-900">
              <div className="relative rounded-t-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-4 text-white">
                <Dialog.Title className="text-base font-bold leading-tight">
                  Creá tu cuenta para contactar
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-emerald-100">
                  Registrate gratis para acceder a WhatsApp e Instagram de los comercios de Catamarca.
                </Dialog.Description>
                <Dialog.Close
                  className="absolute right-3 top-3 rounded-lg p-1 text-emerald-100 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label="Cerrar"
                >
                  <X className="size-4" />
                </Dialog.Close>
              </div>
              <div className="flex flex-col gap-3 p-5">
                <Button
                  render={<Link href="/login?tab=registro" />}
                  className="w-full justify-center bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Registrarse gratis
                </Button>
                <Button
                  render={<Link href="/login" />}
                  variant="outline"
                  className="w-full justify-center border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Ya tengo cuenta
                </Button>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        )}
      </Dialog.Root>
    </>
  );
}
