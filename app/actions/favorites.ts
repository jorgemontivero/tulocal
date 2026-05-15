"use server";

import { createClient } from "@/utils/supabase/server";

export async function addFavorite(shopId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, shop_id: shopId });

  if (error && error.code !== "23505") {
    // 23505 = unique_violation (already favorited), treat as success
    return { error: error.message };
  }
  return { error: null };
}

export async function removeFavorite(shopId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("shop_id", shopId);

  return { error: error?.message ?? null };
}
