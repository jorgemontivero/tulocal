"use server";

import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import {
  requestPasswordResetSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/auth-schemas";

export type AuthActionState = {
  error?: string;
  success?: string;
  requiresEmailConfirmation?: boolean;
};

export async function signIn(input: unknown): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "No pudimos iniciar sesion. Verifica tus datos." };
  }

  return { success: "Sesion iniciada." };
}

export async function signUp(input: unknown): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const { nombre, apellido, celular, email, password } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre,
        apellido,
        celular,
      },
    },
  });

  if (error) {
    return { error: "No pudimos registrar tu cuenta. Proba nuevamente." };
  }

  const needsEmailConfirmation = Boolean(data.user) && !data.session;
  if (needsEmailConfirmation) {
    return {
      success:
        "¡Registro exitoso! Por favor, revisa tu bandeja de entrada (y la carpeta de Spam) para confirmar tu correo y activar tu cuenta.",
      requiresEmailConfirmation: true,
    };
  }

  return {
    success: "Te registraste con exito. Ya puedes iniciar sesion.",
  };
}

function getSiteBaseUrlFromEnv(): string | null {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  return fromEnv || null;
}

async function getRequestBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto =
    h.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

export async function requestPasswordReset(input: unknown): Promise<AuthActionState> {
  const parsed = requestPasswordResetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const supabase = await createClient();
  const baseUrl = getSiteBaseUrlFromEnv() ?? (await getRequestBaseUrl());
  const redirectTo = `${baseUrl.replace(/\/$/, "")}/auth/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo,
  });

  if (error) {
    console.error("[auth] resetPasswordForEmail:", error.message);
    return { error: "No pudimos enviar el enlace de recuperacion. Intenta nuevamente." };
  }

  return {
    success:
      "Si el email existe, te enviamos un enlace para restablecer la contrasena.",
  };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}