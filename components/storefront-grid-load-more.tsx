"use client";

import { useCallback, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListingGallery } from "@/components/listing-gallery";
import {
  listingOriginalBeforeDiscount,
  listingShowsConsultar,
} from "@/lib/listing-display";
import { cn } from "@/lib/utils";
import {
  loadMoreStorefrontListings,
  type StorefrontListing,
} from "@/app/actions/load-more-listings";
import { LISTINGS_PAGE_SIZE } from "@/lib/constants";

function formatARS(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

function ListingCard({ item }: { item: StorefrontListing }) {
  const priceVal = item.price != null ? Number(item.price) : null;
  const disc =
    item.discount_percentage != null ? Number(item.discount_percentage) : null;
  const showConsultar = listingShowsConsultar(priceVal);
  const showOffer = !showConsultar && disc != null && disc > 0 && priceVal != null;

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        item.is_promoted
          ? "border-2 border-emerald-600 bg-emerald-50"
          : "border border-zinc-200 bg-white",
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

      <ListingGallery imageUrls={item.image_urls} />

      <CardHeader>
        <CardTitle className="line-clamp-2">{item.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {item.description ?? "Sin descripcion"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showConsultar ? (
          <p className="font-bold text-emerald-800">Consultar precio</p>
        ) : showOffer && priceVal != null ? (
          <div className="space-y-1">
            <p className="text-sm text-zinc-500 line-through">
              {formatARS(listingOriginalBeforeDiscount(priceVal, disc ?? 0))}
            </p>
            <p className="font-semibold text-emerald-700">{formatARS(priceVal)}</p>
          </div>
        ) : priceVal != null ? (
          <p className="font-semibold text-emerald-700">{formatARS(priceVal)}</p>
        ) : (
          <p className="font-bold text-emerald-800">Consultar precio</p>
        )}
      </CardContent>
    </Card>
  );
}

export type StorefrontGridLoadMoreProps = {
  shopId: string;
  initialListings: StorefrontListing[];
  initialHasMore: boolean;
};

export function StorefrontGridLoadMore({
  shopId,
  initialListings,
  initialHasMore,
}: StorefrontGridLoadMoreProps) {
  const [listings, setListings] = useState(initialListings);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = useCallback(() => {
    startTransition(async () => {
      const result = await loadMoreStorefrontListings({
        shopId,
        offset: listings.length,
      });
      setListings((prev) => [...prev, ...result.listings]);
      setHasMore(result.hasMore);
    });
  }, [shopId, listings.length]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((item, i) => (
          <div
            key={item.id}
            className="animate-in fade-in duration-300"
            style={{
              animationDelay:
                i >= initialListings.length
                  ? `${((i - initialListings.length) % LISTINGS_PAGE_SIZE) * 50}ms`
                  : "0ms",
            }}
          >
            <ListingCard item={item} />
          </div>
        ))}
      </div>

      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={isPending}
            variant="outline"
            className="min-w-[200px] border-emerald-200 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Cargando…
              </>
            ) : (
              "Ver más productos"
            )}
          </Button>
        </div>
      ) : listings.length > LISTINGS_PAGE_SIZE ? (
        <p className="mt-8 text-center text-sm text-zinc-400">
          Has llegado al final del catálogo
        </p>
      ) : null}
    </div>
  );
}
