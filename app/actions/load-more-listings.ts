"use server";

import { createClient } from "@/utils/supabase/server";
import { LISTINGS_PAGE_SIZE } from "@/lib/constants";
import type { Json } from "@/lib/database.types";

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

function isActiveType(v: string): v is "producto" | "servicio" {
  return v === "producto" || v === "servicio";
}

/* ------------------------------------------------------------------ */
/*  Storefront: cargar más productos de un local específico            */
/* ------------------------------------------------------------------ */

export type StorefrontListing = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  discount_percentage: number | null;
  is_promoted: boolean;
  image_urls: Json;
};

export type LoadMoreStorefrontInput = {
  shopId: string;
  offset: number;
};

export type LoadMoreStorefrontResult = {
  listings: StorefrontListing[];
  hasMore: boolean;
};

export async function loadMoreStorefrontListings(
  input: LoadMoreStorefrontInput,
): Promise<LoadMoreStorefrontResult> {
  const supabase = await createClient();

  const from = input.offset;
  const to = from + LISTINGS_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("listings")
    .select("id,title,description,price,discount_percentage,is_promoted,image_urls")
    .eq("shop_id", input.shopId)
    .order("is_promoted", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return { listings: [], hasMore: false };
  }

  const listings: StorefrontListing[] = data.map((l) => ({
    id: String(l.id),
    title: String(l.title),
    description: (l.description as string | null) ?? null,
    price: l.price != null ? Number(l.price) : null,
    discount_percentage: l.discount_percentage != null ? Number(l.discount_percentage) : null,
    is_promoted: Boolean(l.is_promoted),
    image_urls: l.image_urls as Json,
  }));

  return { listings, hasMore: data.length === LISTINGS_PAGE_SIZE };
}

/* ------------------------------------------------------------------ */
/*  Home search: cargar más productos/servicios en búsqueda de texto   */
/* ------------------------------------------------------------------ */

type ShopEmbed = {
  name: string;
  slug: string;
  logo_url: string | null;
  business_type: string | null;
  category_id: string | null;
  subcategory_id: string | null;
};

export type SearchListing = {
  id: string;
  title: string;
  price: number | null;
  image_urls: Json;
  shopName: string;
  shopSlug: string;
  shopLogoUrl: string | null;
};

export type LoadMoreSearchListingsInput = {
  offset: number;
  q: string;
  type?: string;
  cat?: string;
  subcat?: string;
};

export type LoadMoreSearchListingsResult = {
  listings: SearchListing[];
  hasMore: boolean;
};

function unwrapShopEmbed(embedded: unknown): ShopEmbed | null {
  if (embedded == null) return null;
  if (Array.isArray(embedded)) {
    const x = embedded[0];
    return x && typeof x === "object" ? (x as ShopEmbed) : null;
  }
  if (typeof embedded === "object") return embedded as ShopEmbed;
  return null;
}

export async function loadMoreSearchListings(
  input: LoadMoreSearchListingsInput,
): Promise<LoadMoreSearchListingsResult> {
  const supabase = await createClient();

  const safeTerm = input.q.replace(/[%_,]/g, " ").trim();
  if (!safeTerm) return { listings: [], hasMore: false };

  const typeFilter =
    input.type && input.type !== "all" && isActiveType(input.type) ? input.type : "";
  const catFilter =
    input.cat && input.cat !== "all" && isUuid(input.cat) ? input.cat : "";
  const subcatFilter =
    input.subcat && input.subcat !== "all" && isUuid(input.subcat) ? input.subcat : "";

  const oversample = LISTINGS_PAGE_SIZE * 3;
  const from = input.offset;
  const to = from + oversample - 1;

  const { data, error } = await supabase
    .from("listings")
    .select(
      `id, title, price, image_urls, created_at,
       shops ( name, slug, logo_url, business_type, category_id, subcategory_id )`,
    )
    .or(`title.ilike.%${safeTerm}%,description.ilike.%${safeTerm}%`)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return { listings: [], hasMore: false };
  }

  const filtered: SearchListing[] = [];
  for (const row of data) {
    if (filtered.length >= LISTINGS_PAGE_SIZE) break;
    const sh = unwrapShopEmbed(row.shops);
    if (!sh?.slug) continue;
    if (typeFilter && sh.business_type !== typeFilter) continue;
    if (catFilter && sh.category_id !== catFilter) continue;
    if (subcatFilter && sh.subcategory_id !== subcatFilter) continue;
    filtered.push({
      id: String(row.id),
      title: String(row.title),
      price: row.price != null ? Number(row.price) : null,
      image_urls: row.image_urls as Json,
      shopName: sh.name,
      shopSlug: sh.slug,
      shopLogoUrl: sh.logo_url,
    });
  }

  const fetchedFull = data.length === oversample;
  const hasMore = fetchedFull && filtered.length === LISTINGS_PAGE_SIZE;

  return { listings: filtered, hasMore };
}
