"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { LocationPicker } from "@/components/location-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createShop } from "@/app/dashboard/actions";
import type { ShopTaxonomyCategory, ShopTaxonomySubcategory } from "@/lib/shop-taxonomy";
import { cn } from "@/lib/utils";

/** Compat: antes se exportaban estos alias desde este módulo. */
export type TaxonomyCategory = ShopTaxonomyCategory;
export type TaxonomySubcategory = ShopTaxonomySubcategory;

const brandSans = Poppins({
  subsets: ["latin"],
  weight: ["800"],
  style: ["italic"],
  display: "swap",
});

const schema = z.object({
  name: z.string().min(2, "Ingresa un nombre valido."),
  business_type: z.enum(["producto", "servicio"]),
  category_id: z.string().min(1, "Selecciona una categoria."),
  subcategory_id: z.string().min(1, "Selecciona una subcategoria."),
  whatsapp: z.string().min(6, "Ingresa un WhatsApp valido."),
  instagram: z.string().max(100, "Instagram: maximo 100 caracteres."),
  description: z
    .string()
    .min(10, "La descripcion debe tener al menos 10 caracteres.")
    .max(220, "La descripcion no puede superar 220 caracteres."),
  address: z.string().max(300, "Direccion: maximo 300 caracteres."),
  latitude: z.string(),
  longitude: z.string(),
});

type FormValues = z.infer<typeof schema>;

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_SHOP_FLYERS = 3;
const MAX_SHOP_FLYER_BYTES = 5 * 1024 * 1024;
const FLYER_SLOTS = [0, 1, 2] as const;

type FlyerSlot =
  | { kind: "empty" }
  | { kind: "url"; url: string }
  | { kind: "file"; file: File };

function buildInitialFlyerSlots(urls: string[] | undefined): FlyerSlot[] {
  const list = [...(urls ?? [])].slice(0, MAX_SHOP_FLYERS);
  return FLYER_SLOTS.map((i) =>
    list[i] ? { kind: "url" as const, url: list[i] } : { kind: "empty" as const },
  );
}

function FlyerFilePreview({ file, className }: { file: File; className?: string }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- preview local
    <img src={url} alt="" className={className} />
  );
}

type InitialFieldValues = Partial<
  Pick<FormValues, "name" | "whatsapp" | "description" | "instagram" | "address" | "latitude" | "longitude">
>;

function resolveInitialBusinessType(
  initialFromShop: string | null | undefined,
  categoryId: string | null | undefined,
  categories: ShopTaxonomyCategory[],
): "producto" | "servicio" {
  if (initialFromShop === "producto" || initialFromShop === "servicio") {
    return initialFromShop;
  }
  if (categoryId) {
    const row = categories.find((c) => c.id === categoryId);
    if (row) return row.business_type;
  }
  return "producto";
}

/**
 * Listas de rubros: solo vía props desde el Server Component padre (`page.tsx`),
 * cargadas con `fetchShopTaxonomy` → Supabase. No hay arrays estáticos de taxonomía en este archivo.
 */
export function NewShopForm({
  taxonomyCategories,
  taxonomySubcategories,
  initialBusinessType,
  initialCategoryId,
  initialSubcategoryId,
  initialValues,
  initialLogoUrl,
  initialPlanType,
  initialFlyerUrls,
}: {
  taxonomyCategories: ShopTaxonomyCategory[];
  taxonomySubcategories: ShopTaxonomySubcategory[];
  initialBusinessType?: string | null;
  initialCategoryId?: string | null;
  initialSubcategoryId?: string | null;
  initialValues?: InitialFieldValues;
  initialLogoUrl?: string;
  initialPlanType?: string | null;
  initialFlyerUrls?: string[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [flyerError, setFlyerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [flyerSlots, setFlyerSlots] = useState<FlyerSlot[]>(() =>
    buildInitialFlyerSlots(initialFlyerUrls),
  );
  const flyerInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const canUploadFlyers = initialPlanType === "oro" || initialPlanType === "black";

  /** Cálculo síncrono antes de useForm: instante cero con el tipo correcto para el filtro de categorías. */
  const resolvedBusinessType = resolveInitialBusinessType(
    initialBusinessType,
    initialCategoryId ?? undefined,
    taxonomyCategories,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? "",
      business_type: resolvedBusinessType,
      /** Siempre string (nunca undefined) para que Radix Select sea controlado de forma estable. */
      category_id: initialCategoryId != null ? String(initialCategoryId) : "",
      subcategory_id: initialSubcategoryId != null ? String(initialSubcategoryId) : "",
      whatsapp: initialValues?.whatsapp ?? "",
      instagram: initialValues?.instagram ?? "",
      description: initialValues?.description ?? "",
      address: initialValues?.address ?? "",
      latitude: initialValues?.latitude ?? "",
      longitude: initialValues?.longitude ?? "",
    },
  });

  const businessType = form.watch("business_type");
  const categoryId = form.watch("category_id");
  const newFlyerFileCount = flyerSlots.filter((s) => s.kind === "file").length;

  const categoriesForType = taxonomyCategories.filter((c) => c.business_type === businessType);
  const subcategoriesForCategory = taxonomySubcategories.filter((s) => s.category_id === categoryId);

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setFileError(null);
    setFlyerError(null);

    const sub = taxonomySubcategories.find((s) => s.id === values.subcategory_id);
    if (!sub || sub.category_id !== values.category_id) {
      form.setError("subcategory_id", { message: "Elegi una subcategoria valida." });
      return;
    }

    if (selectedLogo && selectedLogo.size > MAX_LOGO_SIZE_BYTES) {
      setFileError("La imagen supera los 5MB. Elige una foto mas liviana.");
      return;
    }

    const filesInSlots = flyerSlots
      .filter((s): s is Extract<FlyerSlot, { kind: "file" }> => s.kind === "file")
      .map((s) => s.file);

    if (filesInSlots.length > MAX_SHOP_FLYERS) {
      setFlyerError("Puedes subir hasta 3 flyers.");
      return;
    }

    for (const file of filesInSlots) {
      if (!file.type.startsWith("image/")) {
        setFlyerError("Los flyers deben ser imagenes validas.");
        return;
      }
      if (file.size > MAX_SHOP_FLYER_BYTES) {
        setFlyerError("Cada flyer debe pesar como maximo 5MB.");
        return;
      }
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", values.name);
      formData.set("business_type", values.business_type);
      formData.set("category_id", values.category_id);
      formData.set("subcategory_id", values.subcategory_id);
      formData.set("whatsapp", values.whatsapp);
      formData.set("instagram", values.instagram.trim());
      formData.set("description", values.description);
      if (values.address) formData.set("address", values.address);
      if (values.latitude) formData.set("latitude", values.latitude);
      if (values.longitude) formData.set("longitude", values.longitude);
      if (selectedLogo) formData.set("logo", selectedLogo);
      if (canUploadFlyers) {
        formData.set("flyer_edit", "1");
        for (let i = 0; i < MAX_SHOP_FLYERS; i++) {
          const slot = flyerSlots[i]!;
          if (slot.kind === "file") {
            formData.set(`flyer_slot_${i}`, slot.file);
            formData.set(`flyer_keep_${i}`, "");
          } else if (slot.kind === "url") {
            formData.set(`flyer_keep_${i}`, slot.url);
          } else {
            formData.set(`flyer_keep_${i}`, "");
          }
        }
      }

      const result = await createShop(formData);
      if (!result.ok) {
        setServerError(result.error ?? "No pudimos guardar el local.");
        return;
      }
      router.push("/dashboard?success=local-creado");
    });
  });

  return (
    <Card className="w-full border border-zinc-200 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <Link
          href="/"
          className="mb-1 flex items-center gap-3 rounded-lg outline-offset-4 hover:opacity-90"
        >
          <Image
            src="/logo-tulocal.png"
            alt=""
            width={200}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
          <span
            className={`${brandSans.className} text-2xl font-extrabold italic tracking-tight text-slate-900`}
          >
            Tu Local
          </span>
        </Link>
        <CardTitle className="text-2xl text-slate-900">Configurar mi Local</CardTitle>
        <CardDescription className="text-slate-700">
          Completa estos datos para publicar tu comercio en tulocal.com.ar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900">Nombre del local</label>
            <Input
              placeholder="Ej: Almacen Central"
              {...form.register("name")}
              autoComplete="organization"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900">Tipo de negocio</label>
            <Controller
              name="business_type"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    form.setValue("category_id", "", { shouldValidate: false, shouldDirty: true });
                    form.setValue("subcategory_id", "", { shouldValidate: false, shouldDirty: true });
                  }}
                >
                  <SelectTrigger className="h-10 w-full bg-white">
                    <SelectValue placeholder="Que ofreces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="producto">Ofrezco productos</SelectItem>
                    <SelectItem value="servicio">Ofrezco servicios</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.business_type && (
              <p className="text-xs text-red-600">
                {form.formState.errors.business_type.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900">Categoria</label>
            {!taxonomyCategories.length ? (
              <div
                className="h-10 w-full animate-pulse rounded-lg bg-zinc-200/90"
                aria-busy
                aria-label="Cargando categorias"
              />
            ) : categoriesForType.length === 0 ? (
              <p className="text-xs text-amber-800">
                No hay categorias para este tipo de negocio. Revisá el seed o elegí otro tipo.
              </p>
            ) : (
              <Controller
                name="category_id"
                control={form.control}
                render={({ field }) => (
                  <Select
                    key={`category-${businessType}-${categoriesForType.length}`}
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      form.setValue("subcategory_id", "", { shouldValidate: false, shouldDirty: true });
                    }}
                  >
                    <SelectTrigger className="h-10 w-full bg-white">
                      <SelectValue placeholder="Selecciona una categoria">
                        {categoriesForType.find((c) => c.id === field.value)?.name ??
                          taxonomyCategories.find((c) => c.id === field.value)?.name ??
                          null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesForType.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {form.formState.errors.category_id && (
              <p className="text-xs text-red-600">{form.formState.errors.category_id.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900">Subcategoria</label>
            {!taxonomyCategories.length ? (
              <div
                className="h-10 w-full animate-pulse rounded-lg bg-zinc-200/90"
                aria-busy
                aria-label="Cargando subcategorias"
              />
            ) : !categoryId ? (
              <p className="text-xs text-zinc-500">Primero elegí una categoria.</p>
            ) : subcategoriesForCategory.length === 0 ? (
              <p className="text-xs text-amber-800">No hay subcategorias para esta categoria.</p>
            ) : (
              <Controller
                name="subcategory_id"
                control={form.control}
                render={({ field }) => (
                  <Select
                    key={`subcategory-${categoryId}-${subcategoriesForCategory.length}`}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="h-10 w-full bg-white">
                      <SelectValue placeholder="Selecciona una subcategoria">
                        {subcategoriesForCategory.find((s) => s.id === field.value)?.name ??
                          taxonomySubcategories.find((s) => s.id === field.value)?.name ??
                          null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {subcategoriesForCategory.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {form.formState.errors.subcategory_id && (
              <p className="text-xs text-red-600">
                {form.formState.errors.subcategory_id.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900">WhatsApp</label>
            <Input
              placeholder="Ej: +54 383 123-4567"
              {...form.register("whatsapp")}
              autoComplete="tel"
            />
            {form.formState.errors.whatsapp && (
              <p className="text-xs text-red-600">{form.formState.errors.whatsapp.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="instagram-username" className="text-sm font-semibold text-slate-900">
              Instagram <span className="font-normal text-zinc-500">(opcional)</span>
            </label>
            <div
              className={cn(
                "flex overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm",
                "focus-within:ring-2 focus-within:ring-emerald-600/30 focus-within:ring-offset-0",
              )}
            >
              <span
                className="flex shrink-0 items-center border-r border-zinc-200 bg-slate-100 px-2 py-2 text-[10px] leading-tight text-zinc-600 sm:px-3 sm:text-xs"
                aria-hidden
              >
                https://www.instagram.com/
              </span>
              <Input
                id="instagram-username"
                type="text"
                placeholder="tu_usuario"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 py-2 shadow-none focus-visible:ring-0"
                {...form.register("instagram")}
              />
            </div>
            {form.formState.errors.instagram && (
              <p className="text-xs text-red-600">{form.formState.errors.instagram.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900">Descripcion breve</label>
            <Textarea
              placeholder="Conta en una oracion que ofreces."
              rows={4}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <LocationPicker
            latitude={form.watch("latitude")}
            longitude={form.watch("longitude")}
            address={form.watch("address")}
            onLatitudeChange={(v) => form.setValue("latitude", v, { shouldDirty: true })}
            onLongitudeChange={(v) => form.setValue("longitude", v, { shouldDirty: true })}
            onAddressChange={(v) => form.setValue("address", v, { shouldDirty: true })}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900">Foto de perfil / logo</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setFileError(null);

                if (file && file.size > MAX_LOGO_SIZE_BYTES) {
                  setSelectedLogo(null);
                  event.currentTarget.value = "";
                  setFileError("La imagen supera los 5MB. Elige una foto mas liviana.");
                  return;
                }

                setSelectedLogo(file);
              }}
            />
            {fileError && <p className="text-xs text-red-600">{fileError}</p>}
            {selectedLogo ? (
              <p className="text-xs text-slate-700">Archivo seleccionado: {selectedLogo.name}</p>
            ) : initialLogoUrl ? (
              <p className="text-xs text-slate-700">Ya tienes un logo cargado.</p>
            ) : (
              <p className="text-xs text-slate-700">Opcional. Puedes cargarlo mas tarde.</p>
            )}
          </div>

          {canUploadFlyers && (
            <div className="space-y-1.5 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
              <label className="text-sm font-semibold text-slate-900">
                Flyers promocionales (hasta 3)
              </label>
              <p className="text-xs text-slate-700">
                Recomendado: vertical 4:5 (como post de Instagram), por ejemplo 1080×1350 px. En
                celular se lee mejor que un flyer muy ancho (2:1).
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {FLYER_SLOTS.map((slot) => {
                  const state = flyerSlots[slot]!;
                  return (
                    <div
                      key={slot}
                      className="space-y-2 rounded-md border border-amber-200 bg-white/80 p-2"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md border border-amber-100 bg-zinc-100">
                        {state.kind === "url" ? (
                          // eslint-disable-next-line @next/next/no-img-element -- URL de storage
                          <img
                            src={state.url}
                            alt={`Flyer ${slot + 1}`}
                            className="h-full w-full object-contain"
                          />
                        ) : state.kind === "file" ? (
                          <FlyerFilePreview
                            file={state.file}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                            Vacío
                          </div>
                        )}
                      </div>
                      <Input
                        ref={(node) => {
                          flyerInputRefs.current[slot] = node;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          setFlyerError(null);
                          const file = event.target.files?.[0] ?? null;
                          if (!file) {
                            return;
                          }
                          if (!file.type.startsWith("image/")) {
                            setFlyerError("Los flyers deben ser imagenes validas.");
                            event.currentTarget.value = "";
                            return;
                          }
                          if (file.size > MAX_SHOP_FLYER_BYTES) {
                            setFlyerError("Cada flyer debe pesar como maximo 5MB.");
                            event.currentTarget.value = "";
                            return;
                          }
                          setFlyerSlots((prev) => {
                            const next = [...prev];
                            next[slot] = { kind: "file", file };
                            return next;
                          });
                        }}
                      />
                      <div className="flex flex-col gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-amber-300 text-amber-800 hover:bg-amber-100"
                          onClick={() => flyerInputRefs.current[slot]?.click()}
                        >
                          {state.kind === "file"
                            ? `Reemplazar archivo ${slot + 1}`
                            : state.kind === "url"
                              ? `Cambiar flyer ${slot + 1}`
                              : `Subir flyer ${slot + 1}`}
                        </Button>
                        {(state.kind === "url" || state.kind === "file") && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 w-full text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
                            onClick={() => {
                              setFlyerError(null);
                              const input = flyerInputRefs.current[slot];
                              if (input) input.value = "";
                              setFlyerSlots((prev) => {
                                const next = [...prev];
                                next[slot] = { kind: "empty" };
                                return next;
                              });
                            }}
                          >
                            Quitar flyer {slot + 1}
                          </Button>
                        )}
                      </div>
                      <p className="line-clamp-2 text-xs text-slate-700">
                        {state.kind === "file"
                          ? state.file.name
                          : state.kind === "url"
                            ? `Guardado · posición ${slot + 1}`
                            : "Sin flyer en este espacio"}
                      </p>
                    </div>
                  );
                })}
              </div>
              {flyerError && <p className="text-xs text-red-600">{flyerError}</p>}
              {newFlyerFileCount > 0 ? (
                <p className="text-xs text-slate-700">
                  {newFlyerFileCount} imagen(es) nueva(s) se subirán al guardar.
                </p>
              ) : (
                <p className="text-xs text-slate-700">
                  Podés quitar cualquier flyer con &quot;Quitar&quot; y guardar sin subir otro. Los
                  cambios aplican al pulsar Guardar cambios.
                </p>
              )}
            </div>
          )}

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <Button
            type="submit"
            className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={isPending}
          >
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
