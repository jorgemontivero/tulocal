"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

const brandSans = Poppins({
  subsets: ["latin"],
  weight: ["800"],
  style: ["italic"],
  display: "swap",
});

export const RUBRO_OTRO_ESPECIFICAR = "Otro, especificar";

export const CATEGORIAS_PREDEFINIDAS = [
  "Gastronomia",
  "Moda",
  "Hogar",
  "Tecnologia",
  "Salud y Belleza",
  "Servicios",
] as const;

const CATEGORIAS_SELECT = [...CATEGORIAS_PREDEFINIDAS, RUBRO_OTRO_ESPECIFICAR];

function initialCategoryFields(stored: string | null | undefined) {
  const c = stored?.trim() ?? "";
  if (!c) return { category: "", categoryCustom: "" };
  if ((CATEGORIAS_PREDEFINIDAS as readonly string[]).includes(c)) {
    return { category: c, categoryCustom: "" };
  }
  return { category: RUBRO_OTRO_ESPECIFICAR, categoryCustom: c };
}

const schema = z
  .object({
    name: z.string().min(2, "Ingresa un nombre valido."),
    category: z.string().min(1, "Selecciona un rubro."),
    categoryCustom: z.string().optional(),
    whatsapp: z.string().min(6, "Ingresa un WhatsApp valido."),
    instagram: z.string().max(100, "Instagram: maximo 100 caracteres."),
    description: z
      .string()
      .min(10, "La descripcion debe tener al menos 10 caracteres.")
      .max(220, "La descripcion no puede superar 220 caracteres."),
  })
  .superRefine((data, ctx) => {
    if (data.category === RUBRO_OTRO_ESPECIFICAR) {
      const t = (data.categoryCustom ?? "").trim();
      if (t.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Especifica el rubro con al menos 2 caracteres.",
          path: ["categoryCustom"],
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;

type InitialFieldValues = Partial<
  Pick<FormValues, "name" | "whatsapp" | "description" | "instagram">
>;

export function NewShopForm({
  initialCategory = "",
  initialValues,
  initialLogoUrl,
}: {
  initialCategory?: string | null;
  initialValues?: InitialFieldValues;
  initialLogoUrl?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);

  const rubroInicial = initialCategoryFields(initialCategory);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? "",
      category: rubroInicial.category,
      categoryCustom: rubroInicial.categoryCustom,
      whatsapp: initialValues?.whatsapp ?? "",
      instagram: initialValues?.instagram ?? "",
      description: initialValues?.description ?? "",
    },
  });

  const categoryWatch = form.watch("category");
  const showCategoryCustom = categoryWatch === RUBRO_OTRO_ESPECIFICAR;

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setFileError(null);

    if (selectedLogo && selectedLogo.size > MAX_LOGO_SIZE_BYTES) {
      setFileError("La imagen supera los 5MB. Elige una foto mas liviana.");
      return;
    }

    const resolvedCategory =
      values.category === RUBRO_OTRO_ESPECIFICAR
        ? (values.categoryCustom ?? "").trim()
        : values.category;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", values.name);
      formData.set("category", resolvedCategory);
      formData.set("whatsapp", values.whatsapp);
      formData.set("instagram", values.instagram.trim());
      formData.set("description", values.description);
      if (selectedLogo) formData.set("logo", selectedLogo);

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
            <label className="text-sm font-semibold text-slate-900">Rubro / Categoria</label>
            <Controller
              name="category"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 w-full bg-white">
                    <SelectValue placeholder="Selecciona un rubro" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_SELECT.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.category && (
              <p className="text-xs text-red-600">{form.formState.errors.category.message}</p>
            )}
          </div>

          {showCategoryCustom && (
            <div className="space-y-1.5">
              <label htmlFor="category-custom" className="text-sm font-semibold text-slate-900">
                Especifica el rubro
              </label>
              <Input
                id="category-custom"
                type="text"
                placeholder="Ej: Servicio Técnico de Drones"
                {...form.register("categoryCustom")}
              />
              {form.formState.errors.categoryCustom && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.categoryCustom.message}
                </p>
              )}
            </div>
          )}

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
