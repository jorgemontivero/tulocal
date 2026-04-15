"use server";

import { leadSchema } from "@/lib/lead-schemas";
import { createClient } from "@/utils/supabase/server";

type Result = { success: true } | { error: string };

export async function submitVisitorLead(data: unknown): Promise<Result> {
  const parsed = leadSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const supabase = await createClient();
  const { name, contact_method, contact_value, source, age_range, gender } =
    parsed.data;

  const { error } = await supabase.from("visitor_leads").insert({
    name,
    contact_method,
    contact_value,
    source,
    age_range: age_range ?? null,
    gender: gender ?? null,
  });

  if (error) {
    console.error("[leads] insert error:", error.message);
    return {
      error: "No pudimos guardar tu información. Intentá de nuevo.",
    };
  }

  return { success: true };
}
