"use server";

import { revalidatePath } from "next/cache";
import { isAdminUser } from "@/lib/auth-admin";
import { createClient } from "@/utils/supabase/server";
import { PLAN_LIMITS } from "@/lib/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  if (!(await isAdminUser(supabase, user))) {
    throw new Error("Sin permisos de admin");
  }
  return supabase;
}

type ActionResult = { ok: boolean; error?: string };

export async function moderateShop(
  shopId: string,
  status: "approved" | "blocked",
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { data: shop } = await supabase
      .from("shops")
      .select("slug")
      .eq("id", shopId)
      .maybeSingle();

    const { error } = await supabase
      .from("shops")
      .update({ status })
      .eq("id", shopId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin");
    revalidatePath("/");
    if (shop?.slug) {
      revalidatePath(`/${shop.slug}`);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function moderateListing(
  listingId: string,
  status: "approved" | "blocked",
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { data: listing } = await supabase
      .from("listings")
      .select("shop_id, shops!inner(slug)")
      .eq("id", listingId)
      .maybeSingle();

    const { error } = await supabase
      .from("listings")
      .update({ status })
      .eq("id", listingId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin");
    revalidatePath("/");
    const shopSlug = Array.isArray(listing?.shops)
      ? listing.shops[0]?.slug
      : (listing?.shops as { slug?: string } | null)?.slug;
    if (shopSlug) {
      revalidatePath(`/${shopSlug}`);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateListingFeatured(
  listingId: string,
  isPromoted: boolean,
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { data: listing } = await supabase
      .from("listings")
      .select("shops!inner(slug)")
      .eq("id", listingId)
      .maybeSingle();

    const { error } = await supabase
      .from("listings")
      .update({ is_promoted: isPromoted })
      .eq("id", listingId);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/admin");
    revalidatePath("/");
    const shopSlug = Array.isArray(listing?.shops)
      ? listing.shops[0]?.slug
      : (listing?.shops as { slug?: string } | null)?.slug;
    if (shopSlug) revalidatePath(`/${shopSlug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteListingAsAdmin(listingId: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { data: listing } = await supabase
      .from("listings")
      .select("shops!inner(slug)")
      .eq("id", listingId)
      .maybeSingle();

    const { data: deleted, error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!deleted) {
      return {
        ok: false,
        error: "No se pudo eliminar la publicacion. Verifica politicas RLS de admin.",
      };
    }

    revalidatePath("/admin");
    revalidatePath("/");
    const shopSlug = Array.isArray(listing?.shops)
      ? listing.shops[0]?.slug
      : (listing?.shops as { slug?: string } | null)?.slug;
    if (shopSlug) revalidatePath(`/${shopSlug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateShopPlan(
  shopId: string,
  planType: string,
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();

    const { count } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shopId);

    const limit = PLAN_LIMITS[planType];
    if (limit === undefined) {
      return { ok: false, error: "Plan no válido." };
    }
    if (limit !== Infinity && count != null && count > limit) {
      return {
        ok: false,
        error: `Este comercio tiene ${count} productos. El plan ${planType} permite hasta ${limit}.`,
      };
    }

    const { error } = await supabase
      .from("shops")
      .update({ plan_type: planType })
      .eq("id", shopId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateShopFeatured(
  shopId: string,
  isFeatured: boolean,
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from("shops")
      .update({ is_featured: isFeatured })
      .eq("id", shopId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateShopStatus(
  shopId: string,
  status: string,
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from("shops")
      .update({ status })
      .eq("id", shopId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
