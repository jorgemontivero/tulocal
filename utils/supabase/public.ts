import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Cliente estático/público de Supabase para su uso en páginas públicas
 * No lee cookies de sesión, por lo que NO opta (poison) las rutas de Next.js
 * al modo Dynamic Rendering, permitiendo Caché Estático (ISR).
 */
export const supabasePublic = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);
