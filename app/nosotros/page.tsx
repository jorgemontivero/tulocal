import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import {
  MapPin,
  Eye,
  Lightbulb,
  BarChart3,
  GraduationCap,
  Users,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Nosotros | tulocal.com.ar — Marketplace de Catamarca",
  description:
    "Conocé al equipo detrás de tulocal.com.ar, el marketplace que conecta vecinos con comercios y servicios locales en Catamarca. Liderado por el Lic. Jorge Luis Montivero.",
  openGraph: {
    title: "Nosotros | tulocal.com.ar",
    description:
      "Impulsando el motor comercial de Catamarca. Conectamos vecinos con comercios y servicios locales.",
    url: "/nosotros",
    siteName: "tulocal.com.ar",
    type: "website",
  },
};

const VALUES = [
  {
    icon: MapPin,
    title: "Identidad local",
    description:
      "Nuestro foco está en Catamarca. Cada funcionalidad se diseña para fortalecer la economía y la comunidad de la provincia.",
  },
  {
    icon: Eye,
    title: "Transparencia",
    description:
      "Información clara, accesible y sin letra chica. Los comerciantes saben exactamente qué obtienen y los usuarios encuentran datos reales.",
  },
  {
    icon: Lightbulb,
    title: "Innovación con propósito",
    description:
      "Usamos tecnología y análisis de datos para resolver problemas concretos del comercio local, no por moda sino por impacto.",
  },
] as const;

export default function NosotrosPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 text-zinc-900">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="text-center">
          <Badge className="mb-6 border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100">
            Hecho en Catamarca
          </Badge>
          <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.15]">
            Impulsando el motor comercial de Catamarca
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-600 sm:text-lg">
            tulocal.com.ar es la plataforma que conecta a los vecinos de Catamarca con los
            comercios y servicios de su ciudad. Nacimos acá, pensamos en local y construimos
            tecnología para que cada negocio tenga la visibilidad que merece.
          </p>
        </section>

        {/* ── Misión ─────────────────────────────────────────────────── */}
        <section className="mt-20 rounded-2xl border border-zinc-100 bg-white px-6 py-10 text-center shadow-sm sm:px-12 sm:py-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
            Nuestra misión
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl font-semibold leading-relaxed text-zinc-900 sm:text-2xl">
            Digitalizar la economía local y democratizar el acceso a la información comercial
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-600 sm:text-base">
            Creemos que cuando un comercio crece, crece todo el barrio. Por eso trabajamos para
            que cada emprendedor, por más pequeño que sea, pueda mostrar lo que ofrece y llegar a
            más clientes sin barreras.
          </p>
        </section>

        {/* ── Diferencial ────────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="text-center">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Nuestro diferencial
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xl font-semibold text-zinc-900 sm:text-2xl">
              Estrategia basada en datos, no en suposiciones
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-100 bg-white px-6 py-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <BarChart3 className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900">Análisis riguroso</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Cada búsqueda, cada filtro y cada decisión de producto se respalda con datos
                reales del mercado catamarqueño.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-100 bg-white px-6 py-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <GraduationCap className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900">Liderazgo académico</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Liderado por un Licenciado en Estadística y docente universitario que aplica
                metodología científica al desarrollo del marketplace.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-100 bg-white px-6 py-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Users className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900">Diseño centrado en el usuario</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Cada funcionalidad está pensada para que encontrar lo que buscás sea rápido,
                claro y sin frustraciones — tanto para comerciantes como para compradores.
              </p>
            </div>
          </div>
        </section>

        {/* ── Valores ────────────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="text-center">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Valores
            </h2>
            <p className="mx-auto mt-3 max-w-md text-xl font-semibold text-zinc-900 sm:text-2xl">
              Lo que nos guía cada día
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-zinc-100 bg-white px-6 py-8 text-center shadow-sm"
              >
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Fundador ───────────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="text-center">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Fundador
            </h2>
          </div>

          <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-8 rounded-2xl border border-zinc-100 bg-white px-6 py-10 shadow-sm sm:flex-row sm:items-start sm:px-10 sm:text-left">
            <div
              className="flex size-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-4xl font-bold text-emerald-800 ring-4 ring-emerald-100/60"
              aria-hidden
            >
              JM
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-zinc-900">Jorge Luis Montivero</h3>
              <p className="mt-1 text-sm font-medium text-emerald-700">
                Fundador de tulocal.com.ar
              </p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                Licenciado en Estadística, docente universitario y analista de datos con
                experiencia en el sector público y privado. Convencido de que la información bien
                organizada puede transformar la realidad económica de una comunidad, creó
                tulocal.com.ar para darle al comercio de Catamarca la herramienta digital que
                necesita para crecer.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <section className="mt-20 rounded-2xl bg-emerald-800 px-6 py-14 text-center text-white shadow-lg sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            ¿Querés que tu negocio forme parte de esta red?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-emerald-100">
            Registrá tu comercio gratis en minutos y empezá a recibir consultas de clientes
            reales de Catamarca.
          </p>
          <Button
            render={<Link href="/login" />}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-base font-semibold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50"
          >
            Registrate gratis
            <ArrowRight className="size-5" />
          </Button>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
