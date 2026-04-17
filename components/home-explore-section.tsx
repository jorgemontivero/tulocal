"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  ShopTaxonomyCategoryWithCounts,
  ShopTaxonomySubcategoryWithCounts,
} from "@/lib/shop-taxonomy";

export type ExploreCategory = ShopTaxonomyCategoryWithCounts;
export type ExploreSubcategory = ShopTaxonomySubcategoryWithCounts;

type TabKey = "producto" | "servicio";

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}

function tabFromSearchParams(
  searchParams: URLSearchParams,
  categories: ShopTaxonomyCategoryWithCounts[],
): TabKey {
  const t = searchParams.get("type");
  if (t === "producto" || t === "servicio") return t;
  const cat = searchParams.get("cat");
  if (cat && categories.length) {
    const row = categories.find((c) => c.id === cat);
    if (row) return row.business_type;
  }
  return "producto";
}

function labelWithCount(name: string, count: number): string {
  return `${name} (${count})`;
}

export function HomeExploreSection({
  categories,
  subcategories,
}: {
  categories: ShopTaxonomyCategoryWithCounts[];
  subcategories: ShopTaxonomySubcategoryWithCounts[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tab = useMemo(
    () => tabFromSearchParams(searchParams, categories),
    [searchParams, categories],
  );

  const catParam = searchParams.get("cat");
  const subcatParam = searchParams.get("subcat");

  const categoriesForTab = useMemo(
    () =>
      categories
        .filter((c) => c.business_type === tab)
        .sort((a, b) => a.name.localeCompare(b.name, "es")),
    [categories, tab],
  );

  const categorySelectValue = useMemo(() => {
    if (!catParam || !isUuid(catParam)) return "all";
    const row = categoriesForTab.find((c) => c.id === catParam);
    if (!row || row.shop_count === 0) return "all";
    return catParam;
  }, [catParam, categoriesForTab]);

  const subcategoriesForCategory = useMemo(() => {
    if (categorySelectValue === "all") return [];
    return subcategories
      .filter((s) => s.category_id === categorySelectValue)
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [subcategories, categorySelectValue]);

  const subcategorySelectValue = useMemo(() => {
    if (categorySelectValue === "all") return "all";
    if (!subcatParam || !isUuid(subcatParam)) return "all";
    const row = subcategoriesForCategory.find((s) => s.id === subcatParam);
    if (!row || row.shop_count === 0) return "all";
    return subcatParam;
  }, [subcatParam, categorySelectValue, subcategoriesForCategory]);

  /** Limpia la URL si apunta a categoría/subcategoría sin locales (evita dead-end). */
  useEffect(() => {
    const p = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (catParam && isUuid(catParam)) {
      const row = categoriesForTab.find((c) => c.id === catParam);
      if (row && row.shop_count === 0) {
        p.delete("cat");
        p.delete("subcat");
        changed = true;
      }
    }

    if (!changed && subcatParam && isUuid(subcatParam)) {
      const sub = subcategories.find((s) => s.id === subcatParam);
      if (sub && sub.shop_count === 0) {
        p.delete("subcat");
        changed = true;
      }
    }

    if (changed) {
      const qs = p.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    }
  }, [catParam, subcatParam, categoriesForTab, subcategories, searchParams, router]);

  /** Siempre string: "all" o UUID; nunca undefined (Select controlado estable). */
  const currentCategoryId: string = categorySelectValue;
  const currentSubcategoryId: string =
    categorySelectValue === "all" ? "all" : subcategorySelectValue;

  function pushParams(mutate: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(searchParams.toString());
    mutate(p);
    const qs = p.toString();
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  }

  function onTabClick(next: TabKey) {
    pushParams((p) => {
      p.set("type", next);
      p.delete("cat");
      p.delete("subcat");
    });
  }

  function onCategoryChange(value: string | null) {
    if (value == null) return;
    pushParams((p) => {
      p.set("type", tab);
      if (value === "all") {
        p.delete("cat");
        p.delete("subcat");
      } else {
        p.set("cat", value);
        p.delete("subcat");
      }
    });
  }

  function onSubcategoryChange(value: string | null) {
    if (value == null) return;
    pushParams((p) => {
      p.set("type", tab);
      if (value === "all") {
        p.delete("subcat");
      } else {
        p.set("subcat", value);
      }
    });
  }

  const categoryTriggerLabel =
    currentCategoryId === "all"
      ? "Todas las categorías"
      : (() => {
          const row = categoriesForTab.find((c) => c.id === currentCategoryId);
          return row ? labelWithCount(row.name, row.shop_count) : "Todas las categorías";
        })();

  const subTriggerLabel =
    currentSubcategoryId === "all"
      ? "Todas las subcategorías"
      : (() => {
          const row =
            subcategoriesForCategory.find((s) => s.id === currentSubcategoryId) ??
            subcategories.find((s) => s.id === currentSubcategoryId);
          return row ? labelWithCount(row.name, row.shop_count) : "Todas las subcategorías";
        })();

  return (
    <section
      className="mb-8 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
      aria-labelledby="explorar-titulo"
    >
      <h2 id="explorar-titulo" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 sm:text-xl">
        Explorá por categoría
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
        Elegí si buscás productos o servicios y refiná con categoría y subcategoría.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onTabClick("producto")}
          className={cn(
            "rounded-2xl border-2 px-5 py-4 text-left text-base font-semibold transition-colors",
            tab === "producto"
              ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm dark:border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-100"
              : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-emerald-300/80 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-500/80",
          )}
        >
          Comprar Productos
        </button>
        <button
          type="button"
          onClick={() => onTabClick("servicio")}
          className={cn(
            "rounded-2xl border-2 px-5 py-4 text-left text-base font-semibold transition-colors",
            tab === "servicio"
              ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm dark:border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-100"
              : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-emerald-300/80 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-500/80",
          )}
        >
          Contratar Servicios
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Categoría
          </label>
          {categories.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Las categorías se cargarán pronto. Si sos desarrollador, ejecutá{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">npm run seed:categories</code>.
            </p>
          ) : categoriesForTab.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay categorías para este tipo aún.</p>
          ) : (
            <Select value={currentCategoryId} onValueChange={onCategoryChange}>
              <SelectTrigger className="h-11 w-full min-w-0 bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                <SelectValue placeholder="Todas las categorías">{categoryTriggerLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categoriesForTab.map((c) => (
                  <SelectItem key={c.id} value={c.id} disabled={c.shop_count === 0}>
                    {labelWithCount(c.name, c.shop_count)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Subcategoría
          </label>
          <Select value={currentSubcategoryId} onValueChange={onSubcategoryChange}>
            <SelectTrigger
              className="h-11 w-full min-w-0 bg-white disabled:cursor-not-allowed disabled:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:disabled:bg-zinc-800"
              disabled={categorySelectValue === "all"}
            >
              <SelectValue placeholder="Todas las subcategorías">{subTriggerLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las subcategorías</SelectItem>
              {subcategoriesForCategory.map((s) => (
                <SelectItem key={s.id} value={s.id} disabled={s.shop_count === 0}>
                  {labelWithCount(s.name, s.shop_count)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categorySelectValue !== "all" && subcategoriesForCategory.length === 0 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">No hay subcategorías cargadas para esta categoría.</p>
          )}
        </div>
      </div>
    </section>
  );
}
