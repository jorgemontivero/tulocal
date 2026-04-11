"use server";

import { createClient } from "@/utils/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/auth-schemas";

export type AuthActionState = {
  error?: string;
  success?: string;
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
  const { error } = await supabase.auth.signUp({
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

  return {
    success:
      "Te registraste con exito. Revisa tu email para confirmar la cuenta y luego inicia sesion.",
  };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}