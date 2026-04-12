import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-emerald-950/30 bg-emerald-800 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap items-center gap-4">
            <Link className="text-white/90 hover:text-white" href="/">
              Inicio
            </Link>
            <Link className="text-white/90 hover:text-white" href="/#comercios">
              Comercios
            </Link>
            <Link className="text-white/90 hover:text-white" href="/nosotros">
              Nosotros
            </Link>
            <Link className="text-white/90 hover:text-white" href="/contacto">
              Contacto
            </Link>
          </nav>
          <p className="text-white/90">Potenciando el comercio local</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 text-xs text-white/60">
          <span>© {new Date().getFullYear()} tulocal.com.ar</span>
          <span className="hidden sm:inline" aria-hidden>·</span>
          <Link className="hover:text-white/90" href="/terminos">
            Términos y condiciones
          </Link>
          <span aria-hidden>·</span>
          <Link className="hover:text-white/90" href="/privacidad">
            Política de privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
