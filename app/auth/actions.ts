"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const authSchema = z.object({
  email: z.email("Ingresa un email valido."),
  password: z
    .string()
    .min(6, "La contrasena debe tener al menos 6 caracteres."),
});

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function signIn(input: z.infer<typeof authSchema>): Promise<AuthActionState> {
  const parsed = authSchema.safeParse(input);
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

export async function signUp(input: z.infer<typeof authSchema>): Promise<AuthActionState> {
  const parsed = authSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return { error: "No pudimos registrar tu cuenta. Proba nuevamente." };
  }

  return {
    success:
      "Te registraste con exito. Revisa tu email para confirmar la cuenta y luego inicia sesion.",
  };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}