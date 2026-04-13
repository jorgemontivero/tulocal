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

export async function moderateListing(
  listingId: string,
  status: "approved" | "blocked",
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from("listings")
      .update({ status })
      .eq("id", listingId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin");
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

    const limit = PLAN_LIMITS[planType] ?? 5;
    if (count != null && count > limit) {
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
