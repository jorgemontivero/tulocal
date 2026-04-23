import * as React from "react";
import { Resend } from "resend";
import { MerchantWelcome } from "@/emails/MerchantWelcome";
import { VisitorCoupon } from "@/emails/VisitorCoupon";

type SendMerchantWelcomeResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string };
type SendVisitorCouponResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string };

const SITE_URL = "https://tulocal.com.ar";
const DISABLE_TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function getBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  return fromEnv || SITE_URL;
}

function isWelcomeEmailDisabled(): boolean {
  const raw = process.env.DISABLE_WELCOME_EMAIL?.trim().toLowerCase() ?? "";
  return DISABLE_TRUE_VALUES.has(raw);
}

function createResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  return new Resend(apiKey);
}

export async function sendMerchantWelcome(
  email: string,
  shopName: string,
): Promise<SendMerchantWelcomeResult> {
  try {
    if (isWelcomeEmailDisabled()) {
      console.info("[mail-service] Merchant welcome email disabled by env flag.");
      return { ok: true, id: null };
    }

    const resend = createResendClient();

    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
    if (!fromEmail) {
      console.error(
        "[mail-service] Missing RESEND_FROM_EMAIL. Use a verified sender address in Resend.",
      );
      return {
        ok: false,
        error: "Missing RESEND_FROM_EMAIL.",
      };
    }

    const baseUrl = getBaseUrl();
    const profileUrl = `${baseUrl.replace(/\/$/, "")}/dashboard`;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Bienvenido a Tu Local - ${shopName}`,
      react: React.createElement(MerchantWelcome, {
        merchantName: shopName,
        profileUrl,
        baseUrl,
      }),
    });

    if (error) {
      console.error("[mail-service] Failed to send merchant welcome email:", {
        to: email,
        shopName,
        message: error.message,
      });
      return {
        ok: false,
        error: error.message || "Unexpected Resend error.",
      };
    }

    console.info("[mail-service] Merchant welcome email sent:", {
      to: email,
      shopName,
      resendId: data?.id ?? null,
    });

    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[mail-service] Unexpected error sending merchant welcome:", {
      to: email,
      shopName,
      message,
    });
    return { ok: false, error: message };
  }
}

export async function sendVisitorCoupon(
  email: string,
  source: string,
): Promise<SendVisitorCouponResult> {
  try {
    const resend = createResendClient();

    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
    if (!fromEmail) {
      console.error(
        "[mail-service] Missing RESEND_FROM_EMAIL. Use a verified sender address in Resend.",
      );
      return {
        ok: false,
        error: "Missing RESEND_FROM_EMAIL.",
      };
    }

    const baseUrl = getBaseUrl();
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Tu cupon de bienvenida en Tu Local",
      react: React.createElement(VisitorCoupon, {
        baseUrl,
        couponCode: "BIENVENIDO10",
      }),
    });

    if (error) {
      console.error("[mail-service] Failed to send visitor coupon email:", {
        to: email,
        source,
        message: error.message,
      });
      return {
        ok: false,
        error: error.message || "Unexpected Resend error.",
      };
    }

    console.info("[mail-service] Visitor coupon email sent:", {
      to: email,
      source,
      resendId: data?.id ?? null,
    });

    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[mail-service] Unexpected error sending visitor coupon:", {
      to: email,
      source,
      message,
    });
    return { ok: false, error: message };
  }
}

