"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LogOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { SiteFooter } from "@/components/site-footer";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningOut, startSignOut] = useTransition();

  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  function handleSignOut() {
    setSignOutError(null);
    startSignOut(async () => {
      try {
        const supabase = createClient();
        const { error: signOutErr } = await supabase.auth.signOut();
        if (signOutErr) {
          console.error("[DashboardError] signOut:", signOutErr.message);
          setSignOutError("No pudimos cerrar sesión. Intentá de nuevo.");
          return;
        }
        router.push("/login");
        router.refresh();
      } catch (e) {
        console.error("[DashboardError] signOut unexpected:", e);
        setSignOutError("No pudimos cerrar sesión. Intentá de nuevo.");
      }
    });
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <div className="flex size-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
          <AlertCircle className="size-10 text-red-600 dark:text-red-400" strokeWidth={1.5} />
        </div>

        <h1 className="mt-8 text-2xl font-bold tracking-tight sm:text-3xl">
          No pudimos cargar el panel
        </h1>

        <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
          Ocurrió un error inesperado. Podés reintentar, volver al inicio o cerrar sesión para
          seguir navegando.
        </p>

        {signOutError ? (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
            {signOutError}
          </p>
        ) : null}

        <div className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Button
            type="button"
            onClick={() => reset()}
            className="inline-flex gap-2 bg-emerald-700 px-6 py-3 text-base text-white shadow-sm hover:bg-emerald-800"
          >
            <RotateCcw className="size-4 shrink-0" />
            Reintentar
          </Button>

          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="outline"
            className="px-6 py-3 text-base"
          >
            Volver al Inicio
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isSigningOut}
            onClick={handleSignOut}
            className="inline-flex gap-2 border-red-200 px-6 py-3 text-base text-red-800 hover:bg-red-50 dark:border-red-900/60 dark:text-red-200 dark:hover:bg-red-950/40"
          >
            <LogOut className="size-4 shrink-0" />
            {isSigningOut ? "Cerrando..." : "Cerrar sesión"}
          </Button>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
