import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Tipos y carga de categorías / subcategorías para el formulario del local.
 * Única fuente de verdad: tablas `categories` y `subcategories` en Supabase (sin listas hardcodeadas en el cliente).
 */
export type ShopTaxonomyCategory = {
  id: string;
  name: string;
  business_type: "producto" | "servicio";
};

export type ShopTaxonomySubcategory = {
  id: string;
  category_id: string;
  name: string;
};

/** Taxonomía para la home: incluye conteo de locales por categoría / subcategoría. */
export type ShopTaxonomyCategoryWithCounts = ShopTaxonomyCategory & { shop_count: number };
export type ShopTaxonomySubcategoryWithCounts = ShopTaxonomySubcategory & { shop_count: number };

function parseShopsCount(embedded: unknown): number {
  if (!Array.isArray(embedded) || embedded.length === 0) return 0;
  const first = embedded[0] as { count?: unknown };
  const n = first?.count;
  if (typeof n === "number" && !Number.isNaN(n)) return n;
  if (typeof n === "string") {
    const parsed = Number.parseInt(n, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Categorías y subcategorías con conteo de `shops` asociados (embed PostgREST `shops(count)`).
 * Para formularios del dashboard usá `fetchShopTaxonomy` (sin agregados).
 */
export async function fetchShopTaxonomyForHome(supabase: SupabaseClient<Database>): Promise<{
  categories: ShopTaxonomyCategoryWithCounts[];
  subcategories: ShopTaxonomySubcategoryWithCounts[];
}> {
  const [{ data: catRows, error: catErr }, { data: subRows, error: subErr }] = await Promise.all([
    supabase.from("categories").select("id,name,business_type, shops(count)"),
    supabase.from("subcategories").select("id,category_id,name, shops(count)"),
  ]);

  const categories: ShopTaxonomyCategoryWithCounts[] =
    !catErr && catRows
      ? catRows
          .map((row) => {
            const c = row as {
              id: string;
              name: string;
              business_type: string;
              shops?: unknown;
            };
            return {
              id: c.id,
              name: c.name,
              business_type: c.business_type as "producto" | "servicio",
              shop_count: parseShopsCount(c.shops),
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name, "es"))
      : [];

  const subcategories: ShopTaxonomySubcategoryWithCounts[] =
    !subErr && subRows
      ? subRows
          .map((row) => {
            const s = row as {
              id: string;
              category_id: string;
              name: string;
              shops?: unknown;
            };
            return {
              id: s.id,
              category_id: s.category_id,
              name: s.name,
              shop_count: parseShopsCount(s.shops),
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name, "es"))
      : [];

  return { categories, subcategories };
}

export async function fetchShopTaxonomy(supabase: SupabaseClient<Database>): Promise<{
  categories: ShopTaxonomyCategory[];
  subcategories: ShopTaxonomySubcategory[];
}> {
  const [{ data: catRows, error: catErr }, { data: subRows, error: subErr }] = await Promise.all([
    supabase.from("categories").select("id,name,business_type").order("name"),
    supabase.from("subcategories").select("id,category_id,name").order("name"),
  ]);

  const categories: ShopTaxonomyCategory[] =
    !catErr && catRows
      ? catRows.map((c) => ({
          id: c.id,
          name: c.name,
          business_type: c.business_type as "producto" | "servicio",
        }))
      : [];

  const subcategories: ShopTaxonomySubcategory[] =
    !subErr && subRows
      ? subRows.map((s) => ({
          id: s.id,
          category_id: s.category_id,
          name: s.name,
        }))
      : [];

  return { categories, subcategories };
}
