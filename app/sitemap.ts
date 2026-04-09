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

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
    },
  ];

  const shopRoutes: MetadataRoute.Sitemap =
    shops
      ?.filter((shop) => !!shop.slug)
      .map((shop) => ({
        url: `${BASE_URL}/${shop.slug}`,
        lastModified: shop.created_at ? new Date(shop.created_at) : new Date(),
        changeFrequency: "weekly" as const,
      })) ?? [];

  return [...staticRoutes, ...shopRoutes];
}
