import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { HeroCarousel } from "@/components/hero-carousel";
import { HomeExploreSection } from "@/components/home-explore-section";
import { SearchBar } from "@/components/search-bar";
import {
  ShopResultsList,
  ShopResultsListSkeleton,
} from "@/components/shop-results-list";
import { fetchShopTaxonomyForHome } from "@/lib/shop-taxonomy";
import { createClient } from "@/utils/supabase/server";

const POPULAR_SEARCHES = [
  { label: "Gastronomía", q: "gastronomia" },
  { label: "Comercio local", q: "comercio" },
  { label: "Servicios", q: "servicios" },
  { label: "Ferretería", q: "ferreteria" },
] as const;

export const metadata: Metadata = {
  title: "tulocal.com.ar | Directorio comercial de Catamarca",
  description:
    "Encuentra comercios, productos y servicios locales en Catamarca. Potenciando el comercio local.",
  openGraph: {
    title: "tulocal.com.ar | Directorio comercial de Catamarca",
    description:
      "Encuentra comercios, productos y servicios locales en Catamarca. Potenciando el comercio local.",
    url: "/",
    siteName: "tulocal.com.ar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "tulocal.com.ar | Directorio comercial de Catamarca",
    description:
      "Encuentra comercios, productos y servicios locales en Catamarca. Potenciando el comercio local.",
  },
};

type HomePageProps = {
  searchParams: Promise<{ q?: string; type?: string; cat?: string; subcat?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const supabase = await createClient();
  const params = await searchParams;
  const q = params.q ?? "";
  const type = params.type ?? "";
  const cat = params.cat ?? "";
  const subcat = params.subcat ?? "";

  const { categories: exploreCategories, subcategories: exploreSubcategories } =
    await fetchShopTaxonomyForHome(supabase);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-zinc-900">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <section className="mb-10 grid gap-10 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="min-w-0">
            <h1 className="max-w-xl text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              Encontrá lo que buscás en Catamarca
            </h1>
            <p className="mt-3 max-w-xl text-base text-zinc-600 sm:text-lg">
              Directorio local con comercios reales: buscá por nombre, explorá categorías y
              contactá por WhatsApp.
            </p>
            <SearchBar className="w-full max-w-xl" updateOn="submit" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Búsquedas populares
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map(({ label, q: term }) => (
                <Link
                  key={term}
                  href={`/?q=${encodeURIComponent(term)}`}
                  scroll={false}
                  className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-900 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="min-w-0 w-full">
            <HeroCarousel />
          </div>
        </section>

        <Suspense
          fallback={
            <div className="mb-8 h-48 animate-pulse rounded-2xl border border-zinc-100 bg-zinc-200/50" />
          }
        >
          <HomeExploreSection
            categories={exploreCategories}
            subcategories={exploreSubcategories}
          />
        </Suspense>

        <Suspense fallback={<ShopResultsListSkeleton />}>
          <ShopResultsList q={q} type={type} cat={cat} subcat={subcat} />
        </Suspense>
      </main>

      <footer className="mt-auto border-t border-emerald-950/30 bg-emerald-800 text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-8">
          <nav className="flex flex-wrap items-center gap-4">
            <Link className="text-white/90 hover:text-white" href="/">
              Inicio
            </Link>
            <Link className="text-white/90 hover:text-white" href="/#comercios">
              Comercios
            </Link>
            <Link className="text-white/90 hover:text-white" href="/contacto">
              Contacto
            </Link>
            <Badge className="border border-white/20 bg-white/10 text-white hover:bg-white/15">
              Catamarca
            </Badge>
          </nav>
          <p className="text-white/90">Potenciando el comercio local</p>
        </div>
      </footer>
    </div>
  );
}
