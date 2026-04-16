"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Search, Star, StarOff, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ManagedListing } from "@/lib/admin";
import { STATUS_LABELS } from "@/lib/admin";
import {
  listingOriginalBeforeDiscount,
  listingShowsConsultar,
  parseListingImageUrls,
} from "@/lib/listing-display";
import { deleteListingAsAdmin, updateListingFeatured } from "@/app/admin/actions";

function formatARS(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  blocked: "bg-red-100 text-red-800",
};

function ListingRow({
  listing: initial,
  onRemove,
}: {
  listing: ManagedListing;
  onRemove: (listingId: string) => void;
}) {
  const [listing, setListing] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const imageUrls = parseListingImageUrls(listing.image_urls);
  const firstImage = imageUrls[0] ?? null;
  const hasOffer =
    listing.price != null &&
    listing.discount_percentage != null &&
    listing.discount_percentage > 0;
  const showConsultar = listingShowsConsultar(listing.price);

  function toggleFeatured() {
    setError(null);
    startTransition(async () => {
      const res = await updateListingFeatured(listing.id, !listing.is_promoted);
      if (!res.ok) {
        setError(res.error ?? "No se pudo actualizar destacado.");
        return;
      }
      setListing((prev) => ({ ...prev, is_promoted: !prev.is_promoted }));
    });
  }

  function removeListing() {
    const confirmed = window.confirm(
      "¿Seguro que queres eliminar esta publicacion? Esta accion no se puede deshacer.",
    );
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteListingAsAdmin(listing.id);
      if (!res.ok) {
        setError(res.error ?? "No se pudo eliminar la publicacion.");
        return;
      }
      onRemove(listing.id);
    });
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100 ring-1 ring-zinc-200">
          {firstImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- URLs de storage
            <img src={firstImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-500">
              Sin foto
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {listing.title}
            </p>
            <Badge className={STATUS_COLORS[listing.status] ?? "bg-zinc-100 text-zinc-700"}>
              {STATUS_LABELS[listing.status] ?? listing.status}
            </Badge>
            {listing.is_promoted && (
              <Badge className="bg-yellow-100 text-yellow-800">Destacado</Badge>
            )}
          </div>

          <p className="mt-1 text-xs text-zinc-500">
            {listing.shop?.name ?? "Local desconocido"} · Vendedor{" "}
            {(listing.shop?.vendor_id ?? "").slice(0, 8) || "N/A"}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-zinc-700">
            {listing.description ?? "Sin descripcion"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {showConsultar ? (
              <Badge variant="outline">Consultar precio</Badge>
            ) : listing.price != null ? (
              hasOffer ? (
                <>
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
                  <Badge className="bg-orange-100 text-orange-800">
                    Oferta {listing.discount_percentage}%
                  </Badge>
                </>
              ) : (
                <span className="text-sm font-semibold text-emerald-700">
                  {formatARS(listing.price)}
                </span>
              )
            ) : null}
          </div>

          {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
        </div>

        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={toggleFeatured}
            className="border-yellow-300 text-yellow-800 hover:bg-yellow-50"
            title={listing.is_promoted ? "Quitar destacado" : "Marcar destacado"}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : listing.is_promoted ? (
              <Star className="size-4 fill-yellow-500 text-yellow-500" />
            ) : (
              <StarOff className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={removeListing}
            className="border-red-200 text-red-700 hover:bg-red-50"
            title="Eliminar publicacion"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ListingsManager({ listings }: { listings: ManagedListing[] }) {
  const [items, setItems] = useState(listings);
  const [shopFilter, setShopFilter] = useState("all");
  const [search, setSearch] = useState("");

  const shopOptions = useMemo(() => {
    const map = new Map<string, { name: string; vendor_id: string }>();
    for (const l of items) {
      if (!l.shop) continue;
      map.set(l.shop_id, { name: l.shop.name, vendor_id: l.shop.vendor_id });
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }));
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((l) => {
      if (shopFilter !== "all" && l.shop_id !== shopFilter) return false;
      if (!term) return true;
      const haystack =
        `${l.title} ${l.description ?? ""} ${l.shop?.name ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [items, search, shopFilter]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900">Gestion de productos</h2>

      <Card className="border border-zinc-200 bg-white shadow-sm">
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
              placeholder="Buscar por producto, descripcion o local..."
              className="pl-9"
            />
          </div>

          <Select value={shopFilter} onValueChange={(v) => setShopFilter(v ?? "all")}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue>
                {shopFilter === "all"
                  ? "Todos los vendedores"
                  : shopOptions.find((s) => s.id === shopFilter)?.name ?? "Vendedor"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los vendedores</SelectItem>
              {shopOptions.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name} ({shop.vendor_id.slice(0, 8)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="border-dashed border-zinc-300">
            <CardContent className="py-10 text-center text-sm text-zinc-500">
              No hay publicaciones para esos filtros.
            </CardContent>
          </Card>
        ) : (
          filtered.map((listing) => (
            <ListingRow
              key={listing.id}
              listing={listing}
              onRemove={(id) => setItems((prev) => prev.filter((x) => x.id !== id))}
            />
          ))
        )}
      </div>

      <p className="text-xs text-zinc-400">
        Mostrando {filtered.length} de {items.length} publicaciones
      </p>
    </div>
  );
}
