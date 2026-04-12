"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveListing } from "@/app/dashboard/actions";
import { parseListingImageUrls } from "@/lib/listing-display";

export const MAX_LISTING_IMAGES = 4;

function parsePriceField(raw: string | undefined): number | null {
  const s = (raw ?? "").trim();
  if (s === "") return null;
  const n = Number(s.replace(",", "."));
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

const schema = z
  .object({
    title: z.string().trim().min(2, "Ingresa un titulo valido."),
    description: z
      .string()
      .trim()
      .min(4, "Ingresa una descripcion mas completa.")
      .max(280, "La descripcion no puede superar 280 caracteres."),
    price: z.string().optional(),
    is_offer: z.boolean(),
    discount_percentage: z.string().optional(),
    is_promoted: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const p = parsePriceField(data.price);
    if (data.is_offer) {
      const ds = (data.discount_percentage ?? "").trim();
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

type FormValues = z.infer<typeof schema>;

export type ListingFormInitial = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  discount_percentage: number | null;
  is_promoted: boolean;
  image_urls: unknown;
};

function priceToField(price: number | null | undefined): string {
  if (price == null) return "";
  const n = typeof price === "number" ? price : Number(price);
  if (!Number.isFinite(n) || n <= 0) return "";
  return String(n);
}

function buildDefaultValues(listing?: ListingFormInitial): FormValues {
  if (!listing) {
    return {
      title: "",
      description: "",
      price: "",
      is_offer: false,
      discount_percentage: "",
      is_promoted: false,
    };
  }
  const disc = listing.discount_percentage;
  const hasOffer = disc != null && Number(disc) > 0;
  return {
    title: listing.title,
    description: listing.description ?? "",
    price: priceToField(listing.price),
    is_offer: hasOffer,
    discount_percentage: hasOffer ? String(disc) : "",
    is_promoted: listing.is_promoted,
  };
}

type ListingFormProps = {
  mode: "create" | "edit";
  listing?: ListingFormInitial;
  fileInputId?: string;
};

export function ListingForm({ mode, listing, fileInputId = "listing-form-images" }: ListingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(listing),
  });

  const isOffer = form.watch("is_offer");
  const existingUrls =
    mode === "edit" && listing ? parseListingImageUrls(listing.image_urls) : [];

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const fd = new FormData();
      if (mode === "edit" && listing) {
        fd.set("listingId", listing.id);
      }
      fd.set("title", values.title);
      fd.set("description", values.description);
      fd.set("price", values.price ?? "");
      if (values.is_offer) fd.set("is_offer", "on");
      fd.set("discount_percentage", values.discount_percentage ?? "");
      if (values.is_promoted) fd.set("is_promoted", "on");
      for (const file of imageFiles) {
        fd.append("images", file, file.name);
      }

      const result = await saveListing(fd);
      if (!result.ok) {
        form.setError("root", {
          message: result.error ?? "No pudimos guardar el item.",
        });
        return;
      }

      if (mode === "create") {
        form.reset(buildDefaultValues());
        setImageFiles([]);
        router.refresh();
        return;
      }

      router.push("/dashboard?success=listing-actualizado");
    });
  });

  const onImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    setImageFiles(picked.slice(0, MAX_LISTING_IMAGES));
    event.target.value = "";
  };

  const submitLabel =
    mode === "create"
      ? isPending
        ? "Guardando..."
        : "Agregar item"
      : isPending
        ? "Guardando..."
        : "Guardar cambios";

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-sm font-semibold text-slate-900">Producto/Servicio</label>
        <Input
          placeholder="Ej: poncho, dulces regionales, pantalón, etc..."
          {...form.register("title")}
        />
        {form.formState.errors.title && (
          <p className="text-xs text-red-600">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-sm font-semibold text-slate-900">Descripcion</label>
        <Textarea
          rows={3}
          placeholder="Describe brevemente que incluye este item."
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-xs text-red-600">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-sm font-semibold text-slate-900">Precio (ARS) - Opcional</label>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="Dejalo vacio para mostrar Consultar precio"
          {...form.register("price")}
        />
        <p className="text-xs text-zinc-500">
          Dejá este campo vacío o en 0 si preferís que el cliente vea &quot;Consultar precio&quot;.
        </p>
        {form.formState.errors.price && (
          <p className="text-xs text-red-600">{form.formState.errors.price.message}</p>
        )}
      </div>

      <label className="flex cursor-pointer items-center gap-2 sm:col-span-2">
        <input
          type="checkbox"
          className="size-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600"
          {...form.register("is_offer")}
        />
        <span className="text-sm font-semibold text-slate-900">Es una Oferta</span>
      </label>

      {isOffer && (
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-sm font-semibold text-slate-900">
            Porcentaje de Descuento (%)
          </label>
          <Input
            type="number"
            min={1}
            max={99}
            step={1}
            placeholder="20"
            {...form.register("discount_percentage")}
          />
          {form.formState.errors.discount_percentage && (
            <p className="text-xs text-red-600">
              {form.formState.errors.discount_percentage.message}
            </p>
          )}
        </div>
      )}

      <label className="flex cursor-pointer items-center gap-2 sm:col-span-2">
        <input
          type="checkbox"
          className="size-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600"
          {...form.register("is_promoted")}
        />
        <span className="text-sm font-semibold text-slate-900">
          Promocionar este producto (Destacado)
        </span>
      </label>

      <div className="space-y-2 sm:col-span-2">
        <p className="text-sm font-semibold text-slate-900">
          Imagenes (hasta {MAX_LISTING_IMAGES})
        </p>
        {mode === "edit" && existingUrls.length > 0 ? (
          <div className="flex flex-wrap gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-2">
            {existingUrls.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-16 w-16 rounded object-cover ring-1 ring-zinc-200"
              />
            ))}
          </div>
        ) : null}
        <div className="relative">
          <input
            id={fileInputId}
            type="file"
            accept="image/*"
            multiple
            onChange={onImagesChange}
            className="sr-only"
          />
          <label
            htmlFor={fileInputId}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-50/60"
          >
            <span className="text-sm font-medium text-emerald-800">
              {mode === "edit" ? "Seleccionar nuevas imagenes" : "Seleccionar imagenes"}
            </span>
            <span className="mt-1 text-xs text-zinc-500">
              Hasta {MAX_LISTING_IMAGES} archivos · JPG, PNG o WebP
            </span>
            {mode === "edit" ? (
              <span className="mt-2 text-xs font-medium text-amber-800">
                Subir nuevas imagenes reemplazará las actuales.
              </span>
            ) : null}
          </label>
        </div>
        {imageFiles.length > 0 ? (
          <ul className="space-y-1 rounded-md border border-zinc-200 bg-white p-3 text-xs text-slate-700">
            {imageFiles.map((file) => (
              <li key={`${file.name}-${file.size}`} className="truncate" title={file.name}>
                {file.name}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex items-end sm:col-span-2">
        <Button
          type="submit"
          className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={isPending}
        >
          {submitLabel}
        </Button>
      </div>

      {form.formState.errors.root && (
        <p className="text-sm text-red-600 sm:col-span-2">{form.formState.errors.root.message}</p>
      )}
    </form>
  );
}
