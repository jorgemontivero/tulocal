import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroCarousel } from "@/components/hero-carousel";
import { HomeVendorCta } from "@/components/home-vendor-cta";
import { NewsletterLeadForm } from "@/components/newsletter-lead-form";
import { SiteFooter } from "@/components/site-footer";
import { HomeExploreSection } from "@/components/home-explore-section";
import { SearchBar } from "@/components/search-bar";
import { ShopResultsList, SkeletonGrid } from "@/components/shop-results-list";
import { fetchShopTaxonomyForHome } from "@/lib/shop-taxonomy";
import { createClient } from "@/utils/supabase/server";

const POPULAR_SEARCHES = [
  { label: "Pizzas", q: "pizzas" },
  { label: "Masajes", q: "masajes" },
  { label: "Pintura", q: "pintura" },
  { label: "Kiosco", q: "kiosco" },
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

  const { categories: exploreCategories, subcategories: exploreSubcategories } =
    await fetchShopTaxonomyForHome(supabase);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "tulocal.com.ar",
    url: "https://tulocal.com.ar",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://tulocal.com.ar/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <div className="flex min-h-screen flex-col bg-slate-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <section className="mb-10 grid gap-10 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="min-w-0">
            <h1 className="max-w-xl text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              Encontrá lo que buscás en Catamarca
            </h1>
            <p className="mt-3 max-w-xl text-base text-zinc-600 dark:text-zinc-300 sm:text-lg">
              Directorio local con comercios reales: buscá por nombre, explorá categorías y
              contactá por WhatsApp.
            </p>
            <SearchBar className="w-full max-w-xl" updateOn="submit" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Búsquedas populares
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map(({ label, q: term }) => (
                <Link
                  key={term}
                  href={`/?q=${encodeURIComponent(term)}`}
                  scroll={false}
                  className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-900 transition-colors hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-700/70 dark:bg-emerald-900/30 dark:text-emerald-100 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/45"
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

        <section className="mb-10 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-5 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/30 sm:p-6">
          <NewsletterLeadForm
            source="home_inline"
            title="Recibí promos de Catamarca"
            description="Te enviamos novedades y cupones de comercios locales. Sin spam."
          />
        </section>

        <HomeVendorCta />

        <Suspense
          fallback={
            <div className="mb-8 h-48 animate-pulse rounded-2xl border border-zinc-100 bg-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-800/50" />
          }
        >
          <HomeExploreSection
            categories={exploreCategories}
            subcategories={exploreSubcategories}
          />
        </Suspense>

        <Suspense fallback={<SkeletonGrid />}>
          <ShopResultsList searchParams={params} />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
    </>
  );
}
