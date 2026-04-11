"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { createListing, deleteListing } from "@/app/dashboard/actions";

const schema = z.object({
  title: z.string().min(2, "Ingresa un titulo valido."),
  description: z
    .string()
    .min(4, "Ingresa una descripcion mas completa.")
    .max(280, "La descripcion no puede superar 280 caracteres."),
  price: z.number().positive("El precio debe ser mayor que 0."),
});

type FormValues = z.infer<typeof schema>;

type ListingItem = {
  id: string;
  title: string;
  description: string | null;
  price: number;
};

function formatARS(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

export function CatalogManager({ listings }: { listings: ListingItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await createListing(values);
      if (!result.ok) {
        form.setError("root", { message: result.error ?? "No pudimos crear el item." });
        return;
      }
      form.reset({ title: "", description: "", price: 0 });
      router.refresh();
    });
  });

  const handleDelete = (listingId: string) => {
    startTransition(async () => {
      const result = await deleteListing(listingId);
      if (!result.ok) {
        form.setError("root", { message: result.error ?? "No pudimos eliminar el item." });
        return;
      }
      router.refresh();
    });
  };

  return (
    <Card className="border border-zinc-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Mi Catalogo</CardTitle>
        <CardDescription className="text-slate-700">
          Agrega productos o servicios para mostrar en tu pagina publica.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900">Precio (ARS)</label>
            <Input
              type="number"
              min="0"
              step="1"
              placeholder="120000"
              {...form.register("price", { valueAsNumber: true })}
            />
            {form.formState.errors.price && (
              <p className="text-xs text-red-600">{form.formState.errors.price.message}</p>
            )}
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Agregar item"}
            </Button>
          </div>

          {form.formState.errors.root && (
            <p className="text-sm text-red-600 sm:col-span-2">
              {form.formState.errors.root.message}
            </p>
          )}
        </form>

        <div className="space-y-3">
          {listings.length === 0 ? (
            <p className="text-sm text-slate-700">Todavia no agregaste items al catalogo.</p>
          ) : (
            listings.map((item) => (
              <Card key={item.id} className="border border-zinc-200">
                <CardContent className="flex items-start justify-between gap-3 pt-4">
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-700">
                      {item.description ?? "Sin descripcion"}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-emerald-700">
                      {formatARS(item.price)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                  >
                    <Trash2 />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
