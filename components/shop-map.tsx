"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type MapShop = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  category_id: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
};

export type MapCategory = {
  id: string;
  name: string;
};

type ShopMapProps = {
  shops: MapShop[];
  categories: MapCategory[];
};

const CATAMARCA_CENTER: [number, number] = [-28.4696, -65.7852];
const DEFAULT_ZOOM = 14;

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 sm:h-[600px]">
      <p className="text-sm text-zinc-500">Cargando mapa…</p>
    </div>
  ),
});

export function ShopMap({ shops, categories }: ShopMapProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredShops = useMemo(
    () =>
      selectedCategory === "all"
        ? shops
        : shops.filter((s) => s.category_id === selectedCategory),
    [shops, selectedCategory],
  );

  const selectedCategoryName =
    selectedCategory === "all"
      ? "Todas las categorías"
      : categories.find((c) => c.id === selectedCategory)?.name ??
        "Todas las categorías";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-xs">
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v ?? "all")}>
            <SelectTrigger className="border-zinc-300 bg-white">
              <SelectValue>{selectedCategoryName}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-zinc-500">
          {filteredShops.length}{" "}
          {filteredShops.length === 1 ? "local encontrado" : "locales encontrados"}
        </p>
      </div>

      <LeafletMap
        shops={filteredShops}
        center={CATAMARCA_CENTER}
        zoom={DEFAULT_ZOOM}
      />
    </div>
  );
}
