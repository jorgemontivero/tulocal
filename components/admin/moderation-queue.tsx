"use client";

import { useTransition } from "react";
import { Check, X, Inbox, Store, ShoppingBag, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PendingShop, PendingListing } from "@/lib/admin";
import { moderateShop, moderateListing } from "@/app/admin/actions";
import {
  listingOriginalBeforeDiscount,
  listingShowsConsultar,
  parseListingImageUrls,
} from "@/lib/listing-display";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatARS(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

function ShopItem({ shop }: { shop: PendingShop }) {
  const [pending, startTransition] = useTransition();

  function handle(status: "approved" | "blocked") {
    startTransition(async () => {
      await moderateShop(shop.id, status);
    });
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
        <Store className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-900">
          {shop.name}
        </p>
        <p className="text-xs text-zinc-500">
          {shop.category ?? "Sin categoría"} · {formatDate(shop.created_at)}
        </p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Button
          disabled={pending}
          onClick={() => handle("approved")}
          className="h-8 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700"
        >
          {pending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Check className="size-3" />
          )}
          <span className="hidden sm:inline">Aprobar</span>
        </Button>
        <Button
          disabled={pending}
          onClick={() => handle("blocked")}
          variant="outline"
          className="h-8 border-red-300 px-3 text-xs text-red-700 hover:bg-red-50"
        >
          {pending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <X className="size-3" />
          )}
          <span className="hidden sm:inline">Rechazar</span>
        </Button>
      </div>
    </div>
  );
}

function ListingItem({
  listing,
  compact = false,
}: {
  listing: PendingListing;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handle(status: "approved" | "blocked") {
    startTransition(async () => {
      await moderateListing(listing.id, status);
    });
  }

  const imageUrls = parseListingImageUrls(listing.image_urls);
  const primaryImage = imageUrls[0] ?? null;
  const hasOffer =
    listing.price != null &&
    listing.discount_percentage != null &&
    listing.discount_percentage > 0;
  const showConsultar = listingShowsConsultar(listing.price);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-800">
          <ShoppingBag className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900">
            {listing.title}
          </p>
          <p className="text-xs text-zinc-500">
            {listing.shop?.name ?? "Local desconocido"} ·{" "}
            {formatDate(listing.created_at)}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button
            disabled={pending}
            onClick={() => handle("approved")}
            className="h-8 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700"
          >
            {pending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Check className="size-3" />
            )}
            <span className="hidden sm:inline">Aprobar</span>
          </Button>
          <Button
            disabled={pending}
            onClick={() => handle("blocked")}
            variant="outline"
            className="h-8 border-red-300 px-3 text-xs text-red-700 hover:bg-red-50"
          >
            {pending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <X className="size-3" />
            )}
            <span className="hidden sm:inline">Rechazar</span>
          </Button>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 space-y-3 border-t border-zinc-100 pt-3">
          {listing.description ? (
            <p className="text-sm text-zinc-700">{listing.description}</p>
          ) : (
            <p className="text-sm text-zinc-500">Sin descripción</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {listing.is_promoted && (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                Destacado
              </Badge>
            )}
            {hasOffer && (
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                Oferta {listing.discount_percentage}%
              </Badge>
            )}

            {showConsultar ? (
              <Badge variant="outline">Consultar precio</Badge>
            ) : listing.price != null ? (
              hasOffer ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-zinc-500 line-through">
                    {formatARS(
                      listingOriginalBeforeDiscount(
                        listing.price,
                        listing.discount_percentage ?? 0,
                      ),
                    )}
                  </span>
                  <span className="text-sm font-semibold text-emerald-700">
                    {formatARS(listing.price)}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-semibold text-emerald-700">
                  {formatARS(listing.price)}
                </span>
              )
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- URLs externas de storage
              <img
                src={primaryImage}
                alt={`Imagen principal de ${listing.title}`}
                className="h-24 w-24 rounded-md object-cover ring-1 ring-zinc-200"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-md bg-zinc-100 text-xs text-zinc-500 ring-1 ring-zinc-200">
                Sin foto
              </div>
            )}

            {imageUrls.slice(1, 4).map((src) => (
              // eslint-disable-next-line @next/next/no-img-element -- URLs externas de storage
              <img
                key={src}
                src={src}
                alt={`Imagen extra de ${listing.title}`}
                className="h-24 w-24 rounded-md object-cover ring-1 ring-zinc-200"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type ModerationQueueProps = {
  pendingShops: PendingShop[];
  pendingListings: PendingListing[];
  /** When true, shows a compact preview (max 3 items) for the Resumen view. */
  preview?: boolean;
};

export function ModerationQueue({
  pendingShops,
  pendingListings,
  preview = false,
}: ModerationQueueProps) {
  const shops = preview ? pendingShops.slice(0, 3) : pendingShops;
  const listings = preview ? pendingListings.slice(0, 3) : pendingListings;
  const isEmpty = pendingShops.length === 0 && pendingListings.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">
          Cola de moderación
        </h2>
        {!isEmpty && (
          <Badge className="border border-amber-200 bg-amber-50 text-amber-800">
            {pendingShops.length + pendingListings.length} pendientes
          </Badge>
        )}
      </div>

      {isEmpty ? (
        <Card className="border-dashed border-zinc-300 bg-zinc-50/50">
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Inbox className="size-10 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-500">
              No hay elementos pendientes de moderación
            </p>
            <p className="text-xs text-zinc-400">
              Todo está aprobado y al día
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {shops.length > 0 && (
            <Card className="border border-zinc-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Store className="size-4 text-emerald-600" />
                  Comercios pendientes
                  <Badge className="ml-auto bg-amber-100 text-amber-800">
                    {pendingShops.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                {shops.map((shop) => (
                  <ShopItem key={shop.id} shop={shop} />
                ))}
                {preview && pendingShops.length > 3 && (
                  <p className="pt-1 text-center text-xs text-zinc-500">
                    +{pendingShops.length - 3} más en la sección de Moderación
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {listings.length > 0 && (
            <Card className="border border-zinc-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShoppingBag className="size-4 text-amber-600" />
                  Publicaciones pendientes
                  <Badge className="ml-auto bg-amber-100 text-amber-800">
                    {pendingListings.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                {listings.map((listing) => (
                  <ListingItem key={listing.id} listing={listing} compact={preview} />
                ))}
                {preview && pendingListings.length > 3 && (
                  <p className="pt-1 text-center text-xs text-zinc-500">
                    +{pendingListings.length - 3} más en la sección de
                    Moderación
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
