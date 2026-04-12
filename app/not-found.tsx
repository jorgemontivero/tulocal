import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 text-zinc-900">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <div className="flex size-24 items-center justify-center rounded-full bg-emerald-100">
          <SearchX className="size-10 text-emerald-700" strokeWidth={1.5} />
        </div>

        <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
          ¡Ups! No encontramos lo que buscás
        </h1>

        <p className="mt-4 text-base leading-relaxed text-zinc-500 sm:text-lg">
          Parece que este local o página no existe en nuestra red de Catamarca.
          Puede que el enlace esté roto o que la dirección haya cambiado.
        </p>

        <Button
          render={<Link href="/" />}
          className="mt-8 bg-emerald-700 px-6 py-3 text-base text-white shadow-sm hover:bg-emerald-800"
        >
          Volver al Inicio
        </Button>
      </div>

      <SiteFooter />
    </main>
  );
}
