"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const newShopSchema = z.object({
  name: z.string().min(2, "Ingresa un nombre valido."),
  category: z.string().min(1, "Selecciona un rubro."),
  whatsapp: z.string().min(6, "Ingresa un WhatsApp valido."),
  instagram: z.string().max(100, "Instagram: maximo 100 caracteres."),
  description: z
    .string()
    .min(10, "La descripcion debe tener al menos 10 caracteres.")
    .max(220, "La descripcion no puede superar 220 caracteres."),
});

export type CreateShopResult = {
  ok: boolean;
  error?: string;
};
export type ListingActionResult = {
  ok: boolean;
  error?: string;
};

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70);
}

function extFromFile(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/jpeg") return "jpg";
  return "jpg";
}

async function getOwnedShopId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("vendor_id", userId)
    .maybeSingle();
  return shop?.id ?? null;
}

export async function createShop(formData: FormData): Promise<CreateShopResult> {
  const parsed = newShopSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    whatsapp: formData.get("whatsapp"),
    instagram: String(formData.get("instagram") ?? ""),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Tu sesion expiro. Vuelve a iniciar sesion." };
  }

  const slug = slugify(parsed.data.name);
  const { data: existingShop } = await supabase
    .from("shops")
    .select("id,logo_url")
    .eq("vendor_id", user.id)
    .maybeSingle();

  let logoUrl: string | null | undefined = existingShop?.logo_url ?? undefined;
  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    if (!logoFile.type.startsWith("image/")) {
      return { ok: false, error: "La foto debe ser una imagen valida." };
    }

    const path = `${user.id}/${crypto.randomUUID()}.${extFromFile(logoFile)}`;
    const { error: uploadError } = await supabase.storage
      .from("shop-logos")
      .upload(path, logoFile, {
        upsert: false,
        contentType: logoFile.type || undefined,
      });

    if (uploadError) {
      return { ok: false, error: "No pudimos subir la imagen. Intenta nuevamente." };
    }

    const { data: publicData } = supabase.storage.from("shop-logos").getPublicUrl(path);
    logoUrl = publicData.publicUrl;
  }

  const instagramUsername =
    parsed.data.instagram?.trim().replace(/^@/, "") ?? "";
  const instagram_username = instagramUsername === "" ? null : instagramUsername;

  const payload = {
    vendor_id: user.id,
    name: parsed.data.name,
    slug,
    category: parsed.data.category,
    whatsapp_number: parsed.data.whatsapp,
    instagram_username,
    description: parsed.data.description,
    logo_url: logoUrl,
  };

  const writeQuery = existingShop
    ? supabase.from("shops").update(payload).eq("id", existingShop.id)
    : supabase.from("shops").insert(payload);

  let { error } = await writeQuery;

  if (
    error?.message.includes("instagram_username") &&
    "instagram_username" in payload
  ) {
    const { instagram_username: _omit, ...withoutInstagram } = payload;
    const retryQuery = existingShop
      ? supabase.from("shops").update(withoutInstagram).eq("id", existingShop.id)
      : supabase.from("shops").insert(withoutInstagram);
    const second = await retryQuery;
    error = second.error;
  }

  if (!error) {
    return { ok: true };
  }

  // Fallback defensivo por si las columnas nuevas aun no fueron creadas.
  if (
    error.message.includes("column shops.whatsapp_number does not exist") ||
    error.message.includes("column shops.category does not exist")
  ) {
    const fallbackPayload = {
      vendor_id: user.id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      logo_url: logoUrl,
    };
    const fallbackQuery = existingShop
      ? supabase.from("shops").update(fallbackPayload).eq("id", existingShop.id)
      : supabase.from("shops").insert(fallbackPayload);
    const { error: fallbackError } = await fallbackQuery;

    if (!fallbackError) {
      return { ok: true };
    }
  }

  return { ok: false, error: "No pudimos guardar tu local. Intenta nuevamente." };
}

const listingSchema = z.object({
  title: z.string().min(2, "Ingresa un titulo valido."),
  description: z
    .string()
    .min(4, "Ingresa una descripcion mas completa.")
    .max(280, "La descripcion no puede superar 280 caracteres."),
  price: z.coerce.number().positive("El precio debe ser mayor que 0."),
});

export async function createListing(input: {
  title: string;
  description: string;
  price: number | string;
}): Promise<ListingActionResult> {
  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos de catalogo invalidos.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Tu sesion expiro. Vuelve a iniciar sesion." };
  }

  const shopId = await getOwnedShopId(user.id);
  if (!shopId) {
    return { ok: false, error: "Primero debes configurar tu local." };
  }

  const { error } = await supabase.from("listings").insert({
    shop_id: shopId,
    title: parsed.data.title,
    description: parsed.data.description,
    price: parsed.data.price,
  });

  if (error) {
    return { ok: false, error: "No pudimos crear el item del catalogo." };
  }

  return { ok: true };
}

export async function deleteListing(listingId: string): Promise<ListingActionResult> {
  if (!listingId) return { ok: false, error: "ID de item invalido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Tu sesion expiro. Vuelve a iniciar sesion." };
  }

  const shopId = await getOwnedShopId(user.id);
  if (!shopId) {
    return { ok: false, error: "No encontramos un local asociado a tu usuario." };
  }

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("shop_id", shopId);

  if (error) {
    return { ok: false, error: "No pudimos eliminar el item del catalogo." };
  }

  return { ok: true };
}
