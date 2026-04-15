"use server";

import { headers } from "next/headers";
import { leadSchema } from "@/lib/lead-schemas";
import { createClient } from "@/utils/supabase/server";

type Result = { success: true } | { error: string };

function readHoneypot(input: unknown): string {
  if (!input || typeof input !== "object") return "";
  const raw = (input as { honeypot?: unknown }).honeypot;
  return typeof raw === "string" ? raw.trim() : "";
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  const xForwardedFor = h.get("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const xRealIp = h.get("x-real-ip")?.trim();
  if (xRealIp) return xRealIp;
  return "unknown";
}

export async function submitVisitorLead(data: unknown): Promise<Result> {
  if (readHoneypot(data).length > 0) {
    return { error: "Solicitud inválida." };
  }

  const parsed = leadSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const supabase = await createClient();
  const clientIp = await getClientIp();
  const { data: isAllowed, error: rateLimitError } = await supabase.rpc(
    "check_and_touch_lead_rate_limit",
    {
      p_client_ip: clientIp,
      p_max_hits: 5,
      p_window_seconds: 600,
    },
  );

  if (rateLimitError) {
    console.error("[leads] rate-limit error:", rateLimitError.message);
    return {
      error: "No pudimos procesar tu solicitud en este momento. Intentá más tarde.",
    };
  }

  if (isAllowed === false) {
    return {
      error: "Recibimos muchos intentos seguidos. Esperá unos minutos e intentá de nuevo.",
    };
  }

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
