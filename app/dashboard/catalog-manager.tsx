"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteListing } from "@/app/dashboard/actions";
import { cn } from "@/lib/utils";
import {
  listingOriginalBeforeDiscount,
  listingShowsConsultar,
  parseListingImageUrls,
} from "@/lib/listing-display";
import { ListingForm, type ListingFormInitial } from "@/app/dashboard/listing-form";

export type ListingItem = ListingFormInitial;

function formatARS(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

function toNum(price: number | null | undefined): number | null {
  if (price == null) return null;
  const n = typeof price === "number" ? price : Number(price);
  return Number.isFinite(n) ? n : null;
}

export function CatalogManager({ listings }: { listings: ListingItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = (listingId: string) => {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteListing(listingId);
      if (!result.ok) {
        setDeleteError(result.error ?? "No pudimos eliminar el item.");
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
        <ListingForm mode="create" fileInputId="listing-catalog-images" />

        {deleteError ? <p className="text-sm text-red-600">{deleteError}</p> : null}

        <div className="space-y-3">
          {listings.length === 0 ? (
            <p className="text-sm text-slate-700">Todavia no agregaste items al catalogo.</p>
          ) : (
            listings.map((item) => {
              const imgs = parseListingImageUrls(item.image_urls);
              const priceVal = toNum(item.price);
              const disc =
                item.discount_percentage == null
                  ? null
                  : Number(item.discount_percentage);
              const showConsultar = listingShowsConsultar(priceVal);
              const showOffer =
                !showConsultar &&
                disc != null &&
                disc > 0 &&
                priceVal != null;

              return (
                <Card
                  key={item.id}
                  className={cn(
                    "relative overflow-hidden",
                    item.is_promoted
                      ? "border-2 border-emerald-600 bg-emerald-50"
                      : "border border-zinc-200",
                  )}
                >
                  {item.is_promoted && (
                    <Badge className="absolute top-2 right-2 z-10 bg-emerald-700 text-white hover:bg-emerald-700">
                      Destacado
                    </Badge>
                  )}
                  {showOffer && (
                    <Badge className="absolute top-2 left-2 z-10 bg-orange-600 text-white hover:bg-orange-600">
                      Oferta {disc}%
                    </Badge>
                  )}

                  {imgs[0] ? (
                    <img
                      src={imgs[0]}
                      alt=""
                      className="h-44 w-full object-cover"
                    />
                  ) : null}

                  {imgs.length > 1 ? (
                    <div className="flex gap-1 overflow-x-auto border-t border-zinc-200 bg-zinc-50 p-2">
                      {imgs.slice(1).map((src) => (
                        <img
                          key={src}
                          src={src}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded object-cover ring-1 ring-zinc-200"
                        />
                      ))}
                    </div>
                  ) : null}

                  <CardContent className="flex items-start justify-between gap-3 pt-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-700">
                        {item.description ?? "Sin descripcion"}
                      </p>
                      <div className="mt-2 space-y-1">
                        {showConsultar ? (
                          <p className="font-bold text-emerald-800">Consultar precio</p>
                        ) : showOffer && priceVal != null ? (
                          <>
                            <p className="text-sm text-zinc-500 line-through">
                              {formatARS(
                                listingOriginalBeforeDiscount(priceVal, disc ?? 0),
                              )}
                            </p>
                            <p className="font-semibold text-emerald-700">
                              {formatARS(priceVal)}
                            </p>
                          </>
                        ) : priceVal != null ? (
                          <p className="font-semibold text-emerald-700">{formatARS(priceVal)}</p>
                        ) : (
                          <p className="font-bold text-emerald-800">Consultar precio</p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        render={<Link href={`/dashboard/catalogo/${item.id}/editar`} />}
                        title="Editar"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        title="Eliminar"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
