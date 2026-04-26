import type { Metadata } from "next";
import {
  Check,
  Star,
  BarChart3,
  Images,
  MapPin,
  MessageCircle,
  Package,
  Search,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Planes y Precios | tulocal.com.ar",
  description:
    "Elegí el plan ideal para tu comercio en Catamarca. Publicá productos, aparecé en el mapa y llegá a más clientes.",
  openGraph: {
    title: "Planes y Precios | tulocal.com.ar",
    description:
      "Potenciá tu comercio en Catamarca con nuestros planes: Bronce, Plata y Oro.",
    url: "/precios",
    siteName: "tulocal.com.ar",
    type: "website",
  },
};

const WA_NUMBER = "5493834997929";

function whatsappUrl(plan: string) {
  const msg = encodeURIComponent(
    `Hola Jorge, quiero contratar el Plan ${plan} para mi comercio`,
  );
  return `https://wa.me/${WA_NUMBER}?text=${msg}`;
}

type PlanFeature = { text: string; icon: React.ElementType };

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  href: string;
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Bronce",
    price: "Gratis",
    period: "",
    description: "Ideal para empezar a mostrar tu comercio en el directorio.",
    features: [
      { text: "Hasta 4 productos publicados", icon: Package },
      { text: "Visibilidad estándar en búsquedas", icon: Search },
      { text: "Perfil con logo y descripción", icon: Shield },
      { text: "Soporte comunitario", icon: Users },
    ],
    cta: "Empezar gratis",
    href: "/login",
  },
  {
    name: "Plata",
    price: "$20.000",
    period: "/mes",
    description:
      "Para comercios que quieren destacarse y llegar a más clientes.",
    popular: true,
    features: [
      { text: "Hasta 20 productos publicados", icon: Package },
      { text: "Prioridad en resultados de búsqueda", icon: Zap },
      { text: "Ubicación en el mapa interactivo", icon: MapPin },
      {
        text: "Flyer promocional en el catálogo público de tu local (hasta 1)",
        icon: Images,
      },
      { text: "Soporte directo por WhatsApp", icon: MessageCircle },
    ],
    cta: "Contratar Plata",
    href: whatsappUrl("Plata"),
  },
  {
    name: "Oro",
    price: "$40.000",
    period: "/mes",
    description:
      "Máxima visibilidad y datos para potenciar tus ventas al máximo.",
    features: [
      { text: "Hasta 80 productos publicados", icon: Package },
      { text: "Banner destacado en la Home", icon: Star },
      { text: "Pin con tu logo en el mapa", icon: MapPin },
      {
        text: "Flyers promocionales en el catálogo público de tu local (hasta 3)",
        icon: Images,
      },
      {
        text: "Reporte estadístico mensual de rendimiento",
        icon: BarChart3,
      },
    ],
    cta: "Contratar Oro",
    href: whatsappUrl("Oro"),
  },
];

export default function PreciosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
        <section className="mb-12 text-center sm:mb-16">
          <Badge className="mb-5 border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700/70 dark:bg-emerald-900/30 dark:text-emerald-100 dark:hover:bg-emerald-900/45">
            Planes flexibles
          </Badge>
          <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.15]">
            Potenciá tu comercio en Catamarca
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-300 sm:text-lg">
            Elegí el plan que mejor se adapte a tus necesidades y empezá a
            vender más hoy mismo.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-3 md:items-start">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col overflow-hidden border bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900",
                plan.popular
                  ? "border-2 border-emerald-600 shadow-emerald-100 dark:shadow-none"
                  : "border-zinc-200 dark:border-zinc-700",
              )}
            >
              {plan.popular && (
                <div className="bg-emerald-600 py-1.5 text-center text-xs font-semibold uppercase tracking-wider text-white">
                  Más popular
                </div>
              )}

              <CardHeader className="space-y-3 pb-4">
                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Plan {plan.name}
                </CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-base text-zinc-500 dark:text-zinc-400">
                      {plan.period}
                    </span>
                  )}
                </div>
                <CardDescription className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-6 pb-6">
                <ul className="flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                          plan.popular
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
                        )}
                      >
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <span className="text-sm leading-snug text-zinc-700 dark:text-zinc-300">
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  render={
                    plan.href.startsWith("http") ? (
                      <a
                        href={plan.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ) : (
                      <a href={plan.href} />
                    )
                  }
                  className={cn(
                    "w-full py-3 text-base font-semibold",
                    plan.popular
                      ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                      : "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
                  )}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-16 text-center">
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Todos los planes incluyen tu perfil en el directorio, enlace a
            WhatsApp y acceso al panel de administración. Los precios están
            expresados en pesos argentinos e incluyen IVA. ¿Tenés dudas?{" "}
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              Escribinos por WhatsApp
            </a>
            .
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
