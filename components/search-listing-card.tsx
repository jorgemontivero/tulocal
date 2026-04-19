import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { parseListingImageUrls, listingShowsConsultar } from "@/lib/listing-display";
import type { Json } from "@/lib/database.types";

function formatARS(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

export type SearchListingCardProps = {
  title: string;
  price: number | null;
  imageUrls: Json;
  shopName: string;
  shopSlug: string;
  shopLogoUrl: string | null;
};

export function SearchListingCard({
  title,
  price,
  imageUrls,
  shopName,
  shopSlug,
  shopLogoUrl,
}: SearchListingCardProps) {
  const urls = parseListingImageUrls(imageUrls);
  const firstImage = urls[0] ?? null;
  const showConsultar = listingShowsConsultar(price);
  const priceLabel = !showConsultar && price != null ? formatARS(price) : "Consultar precio";

  return (
    <Link
      href={`/${shopSlug}`}
      className="group flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:border-zinc-600 dark:bg-zinc-900 dark:shadow-zinc-950/40 dark:hover:border-emerald-500/50 dark:hover:shadow-lg dark:hover:shadow-emerald-950/20"
    >
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:ring-zinc-600">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={`Foto de ${title} — ${shopName}`}
            fill
            sizes="112px"
            className="object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className="flex size-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-medium text-slate-500 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-400"
            aria-hidden
          >
            Sin foto
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-base font-semibold text-zinc-900 group-hover:text-emerald-800 dark:text-zinc-100 dark:group-hover:text-emerald-400">
          {title}
        </h3>
        <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-400">{priceLabel}</p>

        <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-700">
          <Avatar className="size-9 shrink-0 ring-2 ring-white dark:ring-zinc-900">
            {shopLogoUrl ? (
              <AvatarImage src={shopLogoUrl} alt={`Logo de ${shopName}`} />
            ) : null}
            <AvatarFallback className="bg-emerald-100 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
              {shopName.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Vendido por
            </p>
            <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">{shopName}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
