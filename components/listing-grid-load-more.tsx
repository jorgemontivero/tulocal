"use client";

import { useCallback, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchListingCard } from "@/components/search-listing-card";
import {
  loadMoreSearchListings,
  type SearchListing,
  type LoadMoreSearchListingsInput,
} from "@/app/actions/load-more-listings";
import { LISTINGS_PAGE_SIZE } from "@/lib/constants";

export type ListingGridLoadMoreProps = {
  initialListings: SearchListing[];
  initialHasMore: boolean;
  filters: Omit<LoadMoreSearchListingsInput, "offset">;
};

export function ListingGridLoadMore({
  initialListings,
  initialHasMore,
  filters,
}: ListingGridLoadMoreProps) {
  const [listings, setListings] = useState(initialListings);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = useCallback(() => {
    startTransition(async () => {
      const result = await loadMoreSearchListings({
        ...filters,
        offset: listings.length,
      });
      setListings((prev) => [...prev, ...result.listings]);
      setHasMore(result.hasMore);
    });
  }, [filters, listings.length]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <SearchListingCard
              title={item.title}
              price={item.price}
              imageUrls={item.image_urls}
              shopName={item.shopName}
              shopSlug={item.shopSlug}
              shopLogoUrl={item.shopLogoUrl}
            />
          </div>
        ))}
      </div>

      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={isPending}
            variant="outline"
            className="min-w-[200px] border-emerald-200 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-200 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/40"
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
        <p className="mt-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
          Has llegado al final de los productos en esta búsqueda
        </p>
      ) : null}
    </div>
  );
}
