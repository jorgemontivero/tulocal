import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const BASE_URL = "https://tulocal.com.ar";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: shops } = await supabase
    .from("shops")
    .select("slug,created_at")
    .order("created_at", { ascending: false });

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/nosotros`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/precios`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/mapa`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contacto`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terminos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const shopRoutes: MetadataRoute.Sitemap =
    shops
      ?.filter((shop) => !!shop.slug)
      .map((shop) => ({
        url: `${BASE_URL}/${shop.slug}`,
        lastModified: shop.created_at ? new Date(shop.created_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })) ?? [];

  return [...staticRoutes, ...shopRoutes];
}
