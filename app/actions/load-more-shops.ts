"use server";

import { createClient } from "@/utils/supabase/server";
import type { ShopCardShop } from "@/components/shop-card";
import { PAGE_SIZE } from "@/lib/constants";

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

function isActiveType(v: string): v is "producto" | "servicio" {
  return v === "producto" || v === "servicio";
}

export type LoadMoreShopsInput = {
  offset: number;
  q?: string;
  type?: string;
  cat?: string;
  subcat?: string;
};

export type LoadMoreShopsResult = {
  shops: ShopCardShop[];
  hasMore: boolean;
};

export async function loadMoreShops(
  input: LoadMoreShopsInput,
): Promise<LoadMoreShopsResult> {
  const supabase = await createClient();

  const term = (input.q ?? "").trim();
  const safeTerm = term.replace(/[%_,]/g, " ").trim();
  const appliesTextFilter = safeTerm.length > 0;

  const typeFilter =
    input.type && input.type !== "all" && isActiveType(input.type)
      ? input.type
      : "";
  const catFilter =
    input.cat && input.cat !== "all" && isUuid(input.cat) ? input.cat : "";
  const subcatFilter =
    input.subcat && input.subcat !== "all" && isUuid(input.subcat)
      ? input.subcat
      : "";

  let q = supabase
    .from("shops")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (typeFilter) q = q.eq("business_type", typeFilter);
  if (catFilter) q = q.eq("category_id", catFilter);
  if (subcatFilter) q = q.eq("subcategory_id", subcatFilter);
  if (appliesTextFilter) {
    q = q.or(`name.ilike.%${safeTerm}%,description.ilike.%${safeTerm}%`);
  }

  const from = input.offset;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await q.range(from, to);

  if (error || !data) {
    return { shops: [], hasMore: false };
  }

  const shops: ShopCardShop[] = data.map((s) => ({
    id: String(s.id),
    name: String(s.name),
    slug: String(s.slug),
    description: (s.description as string | null) ?? null,
    logo_url: (s.logo_url as string | null) ?? null,
    whatsapp_number: (s.whatsapp_number as string | null) ?? null,
  }));

  return { shops, hasMore: data.length === PAGE_SIZE };
}
