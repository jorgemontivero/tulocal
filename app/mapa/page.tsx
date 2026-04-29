import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { ShopMap, type MapShop, type MapCategory, type MapSubcategory } from "@/components/shop-map";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Mapa de Comercios | tulocal.com.ar",
  description:
    "Explorá el mapa interactivo de comercios y servicios locales en Catamarca. Encontrá locales cerca tuyo.",
  openGraph: {
    title: "Mapa de Comercios | tulocal.com.ar",
    description:
      "Explorá el mapa interactivo de comercios y servicios locales en Catamarca.",
    url: "/mapa",
    siteName: "tulocal.com.ar",
    type: "website",
  },
};

export default async function MapaPage() {
  const supabase = await createClient();

  const [shopsRes, categoriesRes, subcategoriesRes] = await Promise.all([
    supabase
      .from("shops")
      .select("id,name,slug,logo_url,plan_type,category_id,subcategory_id,address,latitude,longitude")
      .eq("status", "approved")
      .in("plan_type", ["bronce", "plata", "oro", "black"])
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("name"),
    supabase
      .from("categories")
      .select("id,name")
      .order("name"),
    supabase
      .from("subcategories")
      .select("id,name,category_id")
      .order("name"),
  ]);

  const shops: MapShop[] =
    shopsRes.data?.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      logo_url: s.logo_url,
      plan_type: s.plan_type,
      category_id: s.category_id,
      subcategory_id: s.subcategory_id,
      address: s.address,
      latitude: s.latitude!,
      longitude: s.longitude!,
    })) ?? [];

  const categories: MapCategory[] =
    categoriesRes.data?.map((c) => ({ id: c.id, name: c.name })) ?? [];

  const subcategories: MapSubcategory[] =
    subcategoriesRes.data?.map((s) => ({
      id: s.id,
      name: s.name,
      category_id: s.category_id,
    })) ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Mapa de comercios
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Explorá los comercios de Catamarca en el mapa y encontrá cómo llegar.
          </p>
        </div>

        <ShopMap shops={shops} categories={categories} subcategories={subcategories} />
      </main>
      <SiteFooter />
    </div>
  );
}
