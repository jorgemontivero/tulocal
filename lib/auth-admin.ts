import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Comprueba si el usuario es administrador.
 * 1) Variable de entorno ADMIN_EMAILS (lista separada por comas) — funciona aunque falle RLS en profiles.
 * 2) Tabla profiles.role === 'admin' — requiere policy profiles_self_read o fila visible.
 */
export function isAdminByEnvEmail(email: string | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? "";
  const allowed = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export async function isAdminUser(
  supabase: SupabaseClient<Database>,
  user: User | null,
): Promise<boolean> {
  if (!user) return false;
  if (isAdminByEnvEmail(user.email ?? undefined)) return true;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[auth-admin] profiles select:", error.message);
    return false;
  }

  return profile?.role === "admin";
}
