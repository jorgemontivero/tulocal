"use client";

import { useCallback, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopCard, type ShopCardShop } from "@/components/shop-card";
import {
  loadMoreShops,
  type LoadMoreShopsInput,
} from "@/app/actions/load-more-shops";
import { PAGE_SIZE } from "@/lib/constants";

export type ShopGridLoadMoreProps = {
  initialShops: ShopCardShop[];
  initialHasMore: boolean;
  filters: Omit<LoadMoreShopsInput, "offset">;
};

export function ShopGridLoadMore({
  initialShops,
  initialHasMore,
  filters,
}: ShopGridLoadMoreProps) {
  const [shops, setShops] = useState(initialShops);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = useCallback(() => {
    startTransition(async () => {
      const result = await loadMoreShops({
        ...filters,
        offset: shops.length,
      });
      setShops((prev) => [...prev, ...result.shops]);
      setHasMore(result.hasMore);
    });
  }, [filters, shops.length]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop, i) => (
          <div
            key={shop.id}
            className="animate-in fade-in duration-300"
            style={{ animationDelay: i >= initialShops.length ? `${(i - initialShops.length) % PAGE_SIZE * 50}ms` : "0ms" }}
          >
            <ShopCard shop={shop} variant="directory" />
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
              "Ver más locales"
            )}
          </Button>
        </div>
      ) : shops.length > PAGE_SIZE ? (
        <p className="mt-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
          Has llegado al final de los locales en esta categoría
        </p>
      ) : null}
    </div>
  );
}
