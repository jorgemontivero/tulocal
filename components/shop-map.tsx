"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
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
  plan_type: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
};

export type MapCategory = {
  id: string;
  name: string;
};

export type MapSubcategory = {
  id: string;
  name: string;
  category_id: string;
};

type ShopMapProps = {
  shops: MapShop[];
  categories: MapCategory[];
  subcategories: MapSubcategory[];
};

const CATAMARCA_CENTER: [number, number] = [-28.4696, -65.7852];
const DEFAULT_ZOOM = 14;

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 sm:h-[600px]">
      <p className="text-sm text-zinc-500 dark:text-zinc-300">Cargando mapa…</p>
    </div>
  ),
});

export function ShopMap({ shops, categories, subcategories }: ShopMapProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");

  const subcategoriesForCategory = useMemo(
    () =>
      selectedCategory === "all"
        ? []
        : subcategories.filter((s) => s.category_id === selectedCategory),
    [subcategories, selectedCategory],
  );

  const filteredShops = useMemo(() => {
    let result = shops;
    if (selectedCategory !== "all") {
      result = result.filter((s) => s.category_id === selectedCategory);
    }
    if (selectedSubcategory !== "all") {
      result = result.filter((s) => s.subcategory_id === selectedSubcategory);
    }
    return result;
  }, [shops, selectedCategory, selectedSubcategory]);

  const selectedCategoryName =
    selectedCategory === "all"
      ? "Todas las categorías"
      : categories.find((c) => c.id === selectedCategory)?.name ??
        "Todas las categorías";

  const selectedSubcategoryName =
    selectedSubcategory === "all"
      ? "Todas las subcategorías"
      : subcategoriesForCategory.find((s) => s.id === selectedSubcategory)
          ?.name ?? "Todas las subcategorías";

  function handleCategoryChange(v: string | null) {
    setSelectedCategory(v ?? "all");
    setSelectedSubcategory("all");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-56">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
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

          {subcategoriesForCategory.length > 0 && (
            <div className="w-full sm:w-56">
              <Select
                value={selectedSubcategory}
                onValueChange={(v) => setSelectedSubcategory(v ?? "all")}
              >
                <SelectTrigger className="border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                  <SelectValue>{selectedSubcategoryName}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las subcategorías</SelectItem>
                  {subcategoriesForCategory.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-300">
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
