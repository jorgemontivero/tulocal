"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { leadSchema } from "@/lib/lead-schemas";
import { createClient } from "@/utils/supabase/server";
import { sendVisitorCoupon } from "@/lib/mail-service";

type Result = { success: true } | { error: string };
type CaptureLeadResult = { success: true } | { error: string };

const captureLeadSchema = z.object({
  email: z.email("Ingresa un email valido."),
  source: z.string().trim().min(1, "Source invalida.").max(80, "Source invalida."),
});

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

function triggerVisitorCouponEmail(email: string, source: string): void {
  void sendVisitorCoupon(email, source).catch((error) => {
    console.error("[leads] unexpected visitor coupon email failure:", {
      email,
      source,
      message: error instanceof Error ? error.message : String(error),
    });
  });
}

export async function captureLead(
  email: string,
  source: string,
): Promise<CaptureLeadResult> {
  const parsed = captureLeadSchema.safeParse({
    email,
    source,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos invalidos.",
    };
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const normalizedSource = parsed.data.source.trim();

  const supabase = await createClient();
  const { error } = await supabase.from("visitor_leads").insert({
    name: "Visitante",
    contact_method: "email",
    contact_value: normalizedEmail,
    email: normalizedEmail,
    source: normalizedSource,
  });

  if (error) {
    if (error.code === "23505") {
      console.info("[leads] captureLead duplicate email ignored:", {
        email: normalizedEmail,
        source: normalizedSource,
      });
      return { success: true };
    }

    console.error("[leads] captureLead insert error:", {
      email: normalizedEmail,
      source: normalizedSource,
      message: error.message,
    });
    return { error: "No pudimos guardar tu email. Intenta nuevamente." };
  }

  triggerVisitorCouponEmail(normalizedEmail, normalizedSource);
  return { success: true };
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
  const email = contact_method === "email" ? contact_value.trim().toLowerCase() : null;

  const { error } = await supabase.from("visitor_leads").insert({
    name,
    contact_method,
    contact_value,
    email,
    source,
    age_range: age_range ?? null,
    gender: gender ?? null,
  });

  if (error) {
    if (error.code === "23505" && email) {
      console.info("[leads] duplicate email ignored from promo form:", {
        email,
        source,
      });
      return { success: true };
    }

    console.error("[leads] insert error:", error.message);
    return {
      error: "No pudimos guardar tu información. Intentá de nuevo.",
    };
  }

  if (email) {
    triggerVisitorCouponEmail(email, source);
  }

  return { success: true };
}
