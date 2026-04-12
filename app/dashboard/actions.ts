"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { parseListingImageUrls } from "@/lib/listing-display";

const newShopSchema = z.object({
  name: z.string().min(2, "Ingresa un nombre valido."),
  business_type: z.enum(["producto", "servicio"], {
    error: "Selecciona el tipo de negocio.",
  }),
  category_id: z.uuid("Selecciona una categoria valida."),
  subcategory_id: z.uuid("Selecciona una subcategoria valida."),
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

/** Nombre de archivo seguro + extensión para paths en Storage (sin colisiones entre ítems). */
function uniqueListingImagePath(
  userId: string,
  batchId: string,
  file: File,
  index: number,
): string {
  const ext = extFromFile(file);
  const rawBase = file.name.replace(/\.[^.]+$/, "");
  const safe =
    rawBase
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "imagen";
  const unique = crypto.randomUUID();
  return `${userId}/listings/${batchId}/${index}-${unique}-${safe}.${ext}`;
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

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

async function uploadListingImageFiles(
  supabase: SupabaseServer,
  userId: string,
  rawFiles: File[],
): Promise<{ ok: true; urls: string[] } | { ok: false; error: string }> {
  if (rawFiles.length === 0) {
    return { ok: true, urls: [] };
  }
  const uploadBatchId = crypto.randomUUID();
  try {
    const urls = await Promise.all(
      rawFiles.map(async (file, index) => {
        const path = uniqueListingImagePath(userId, uploadBatchId, file, index);
        const { error: uploadError } = await supabase.storage.from("shop-logos").upload(
          path,
          file,
          {
            upsert: false,
            contentType: file.type || undefined,
          },
        );

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: publicData } = supabase.storage.from("shop-logos").getPublicUrl(path);
        return publicData.publicUrl;
      }),
    );
    return { ok: true, urls };
  } catch {
    return {
      ok: false,
      error: "No pudimos subir una de las imagenes. Intenta nuevamente.",
    };
  }
}

export async function createShop(formData: FormData): Promise<CreateShopResult> {
  const parsed = newShopSchema.safeParse({
    name: formData.get("name"),
    business_type: formData.get("business_type"),
    category_id: formData.get("category_id"),
    subcategory_id: formData.get("subcategory_id"),
    whatsapp: formData.get("whatsapp"),
    instagram: String(formData.get("instagram") ?? ""),
    description: formData.get("description"),
  });

  const rawAddress = String(formData.get("address") ?? "").trim();
  const rawLat = String(formData.get("latitude") ?? "").trim();
  const rawLng = String(formData.get("longitude") ?? "").trim();
  const parsedLat = rawLat ? Number.parseFloat(rawLat) : null;
  const parsedLng = rawLng ? Number.parseFloat(rawLng) : null;
  const locationAddress = rawAddress || null;
  const locationLat =
    parsedLat != null && Number.isFinite(parsedLat) ? parsedLat : null;
  const locationLng =
    parsedLng != null && Number.isFinite(parsedLng) ? parsedLng : null;

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

  const { data: subRow, error: subErr } = await supabase
    .from("subcategories")
    .select("id, name, category_id")
    .eq("id", parsed.data.subcategory_id)
    .maybeSingle();

  if (subErr || !subRow) {
    return { ok: false, error: "La subcategoria seleccionada no es valida." };
  }

  const { data: catRow, error: catErr } = await supabase
    .from("categories")
    .select("id, name, business_type")
    .eq("id", subRow.category_id)
    .maybeSingle();

  if (catErr || !catRow) {
    return { ok: false, error: "La categoria no es valida." };
  }

  if (catRow.id !== parsed.data.category_id) {
    return { ok: false, error: "La categoria y la subcategoria no coinciden." };
  }

  if (catRow.business_type !== parsed.data.business_type) {
    return {
      ok: false,
      error: "El tipo de negocio no coincide con la categoria elegida.",
    };
  }

  const categoryLabel = `${catRow.name} — ${subRow.name}`;

  const payload = {
    vendor_id: user.id,
    name: parsed.data.name,
    slug,
    category: categoryLabel,
    business_type: parsed.data.business_type,
    category_id: parsed.data.category_id,
    subcategory_id: parsed.data.subcategory_id,
    whatsapp_number: parsed.data.whatsapp,
    instagram_username,
    description: parsed.data.description,
    logo_url: logoUrl,
    address: locationAddress,
    latitude: locationLat,
    longitude: locationLng,
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

  if (
    error &&
    (error.message.includes("business_type") ||
      error.message.includes("category_id") ||
      error.message.includes("subcategory_id"))
  ) {
    const {
      business_type: _bt,
      category_id: _ci,
      subcategory_id: _si,
      ...legacyPayload
    } = payload;
    const legacyQuery = existingShop
      ? supabase.from("shops").update(legacyPayload).eq("id", existingShop.id)
      : supabase.from("shops").insert(legacyPayload);
    const third = await legacyQuery;
    error = third.error;
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

const MAX_LISTING_IMAGES = 4;
const MAX_LISTING_IMAGE_BYTES = 5 * 1024 * 1024;

function parseListingPrice(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (s === "") return null;
  const n = Number(s.replace(",", "."));
  if (Number.isNaN(n)) return null;
  if (n <= 0) return null;
  return n;
}

const listingFormSchema = z
  .object({
    title: z.string().trim().min(2, "Ingresa un titulo valido."),
    description: z
      .string()
      .trim()
      .min(4, "Ingresa una descripcion mas completa.")
      .max(280, "La descripcion no puede superar 280 caracteres."),
    price: z.union([z.string(), z.number()]).optional(),
    is_offer: z.boolean(),
    discount_percentage: z.union([z.string(), z.number()]).optional(),
    is_promoted: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const p = parseListingPrice(data.price);
    if (data.is_offer) {
      const ds = String(data.discount_percentage ?? "").trim();
      const d = ds === "" ? Number.NaN : Number(ds.replace(",", "."));
      if (!Number.isFinite(d) || d < 1 || d > 99) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discount_percentage"],
          message: "Ingresa un porcentaje entre 1 y 99.",
        });
      }
      if (p === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message: "Con oferta indicá el precio final del producto.",
        });
      }
    }
  });

export async function saveListing(formData: FormData): Promise<ListingActionResult> {
  const listingId = String(formData.get("listingId") ?? "").trim();

  const parsed = listingFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    is_offer: formData.get("is_offer") === "on",
    discount_percentage: formData.get("discount_percentage"),
    is_promoted: formData.get("is_promoted") === "on",
  });

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

  const priceValue = parseListingPrice(parsed.data.price);
  const discountPct = parsed.data.is_offer
    ? Math.round(
        Number(String(parsed.data.discount_percentage ?? "").replace(",", ".")),
      )
    : null;

  const rawFiles = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_LISTING_IMAGES);

  for (const file of rawFiles) {
    if (file.size > MAX_LISTING_IMAGE_BYTES) {
      return {
        ok: false,
        error: "Cada imagen debe pesar como maximo 5MB.",
      };
    }
    if (!file.type.startsWith("image/")) {
      return { ok: false, error: "Solo se permiten archivos de imagen." };
    }
  }

  const payload = {
    title: parsed.data.title.trim(),
    description: parsed.data.description.trim(),
    price: priceValue,
    discount_percentage: discountPct,
    is_promoted: parsed.data.is_promoted,
  };

  if (listingId) {
    const { data: existing, error: fetchError } = await supabase
      .from("listings")
      .select("id, shop_id, image_urls")
      .eq("id", listingId)
      .maybeSingle();

    if (fetchError || !existing || existing.shop_id !== shopId) {
      return {
        ok: false,
        error: "No encontramos ese producto o no tenes permiso para editarlo.",
      };
    }

    let imageUrls: string[];
    if (rawFiles.length > 0) {
      const uploaded = await uploadListingImageFiles(supabase, user.id, rawFiles);
      if (!uploaded.ok) {
        return { ok: false, error: uploaded.error };
      }
      imageUrls = uploaded.urls;
    } else {
      imageUrls = parseListingImageUrls(existing.image_urls);
    }

    const { error } = await supabase
      .from("listings")
      .update({
        ...payload,
        image_urls: imageUrls,
      })
      .eq("id", listingId)
      .eq("shop_id", shopId);

    if (error) {
      return { ok: false, error: "No pudimos actualizar el item del catalogo." };
    }

    return { ok: true };
  }

  let imageUrls: string[] = [];
  if (rawFiles.length > 0) {
    const uploaded = await uploadListingImageFiles(supabase, user.id, rawFiles);
    if (!uploaded.ok) {
      return { ok: false, error: uploaded.error };
    }
    imageUrls = uploaded.urls;
  }

  const { error } = await supabase.from("listings").insert({
    shop_id: shopId,
    ...payload,
    image_urls: imageUrls,
  });

  if (error) {
    return { ok: false, error: "No pudimos crear el item del catalogo." };
  }

  return { ok: true };
}

/** @deprecated Usá `saveListing`; se mantiene por compatibilidad. */
export const createListing = saveListing;

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
