"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 text-zinc-900">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <div className="flex size-24 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="size-10 text-red-600" strokeWidth={1.5} />
        </div>

        <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
          Algo salió mal en la conexión
        </h1>

        <p className="mt-4 text-base leading-relaxed text-zinc-500 sm:text-lg">
          Hubo un error inesperado. No te preocupes, esto ya fue reportado para
          que nuestro equipo lo revise.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            onClick={reset}
            className="bg-emerald-700 px-6 py-3 text-base text-white shadow-sm hover:bg-emerald-800"
          >
            <RotateCcw />
            Reintentar
          </Button>

          <Button
            render={<Link href="/" />}
            variant="outline"
            className="px-6 py-3 text-base"
          >
            Volver al Inicio
          </Button>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
