import Link from "next/link";
import { Store } from "lucide-react";

/** CTA destacada bajo el hero para incentivar el registro de comercios. */
export function HomeVendorCta() {
  return (
    <section
      className="mb-10 overflow-hidden rounded-2xl border border-emerald-800/40 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 px-5 py-8 text-center shadow-lg ring-1 ring-white/10 sm:px-8 sm:py-10 dark:border-emerald-500/35 dark:from-emerald-900 dark:via-emerald-950 dark:to-zinc-950 dark:ring-emerald-400/10"
      aria-labelledby="vendor-cta-heading"
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex justify-center">
          <span className="inline-flex rounded-2xl bg-white/15 p-3 text-white shadow-inner ring-1 ring-white/20">
            <Store className="size-8 sm:size-9" aria-hidden />
          </span>
        </div>
        <h2
          id="vendor-cta-heading"
          className="text-2xl font-bold tracking-tight text-white sm:text-3xl sm:leading-tight"
        >
          ¿Tenés un negocio?{" "}
          <span className="whitespace-nowrap text-emerald-100">Sumalo gratis</span>
        </h2>
        <p className="mt-3 text-pretty text-base leading-relaxed text-emerald-50/95 sm:text-lg">
          Creá tu perfil en minutos, mostrá productos o servicios y dejá que los clientes te
          contacten por WhatsApp. Empezá sin costo.
        </p>
        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-emerald-900 shadow-md transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
          >
            Crear mi perfil gratis
          </Link>
          <Link
            href="/precios"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 bg-white/10 px-6 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
          >
            Ver planes
          </Link>
        </div>
      </div>
    </section>
  );
}
