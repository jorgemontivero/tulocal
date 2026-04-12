import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SearchListingCard } from "@/components/search-listing-card";
import { createClient } from "@/utils/supabase/server";
import { ShopCard, type ShopCardShop } from "@/components/shop-card";
import type { Json } from "@/lib/database.types";

const RESULT_LIMIT_FILTERED = 48;
const RESULT_LIMIT_DEFAULT = 24;
const LISTINGS_FETCH_CAP = 120;

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}

/** Params de búsqueda de la home (query string). */
export type HomeResultsSearchParams = {
  q?: string;
  type?: string;
  cat?: string;
  subcat?: string;
};

export type ShopResultsListProps = {
  searchParams: HomeResultsSearchParams;
};

function normalizeParam(v: string | undefined): string {
  return (v ?? "").trim();
}

function isActiveType(v: string): v is "producto" | "servicio" {
  return v === "producto" || v === "servicio";
}

type ShopEmbed = {
  name: string;
  slug: string;
  logo_url: string | null;
  business_type: string | null;
  category_id: string | null;
  subcategory_id: string | null;
};

function unwrapShopEmbed(embedded: unknown): ShopEmbed | null {
  if (embedded == null) return null;
  if (Array.isArray(embedded)) {
    const x = embedded[0];
    return x && typeof x === "object" ? (x as ShopEmbed) : null;
  }
  if (typeof embedded === "object") return embedded as ShopEmbed;
  return null;
}

function shopMatchesExploreFilters(
  shop: ShopEmbed,
  typeFilter: string,
  catFilter: string,
  subcatFilter: string,
): boolean {
  if (typeFilter && shop.business_type !== typeFilter) return false;
  if (catFilter && shop.category_id !== catFilter) return false;
  if (subcatFilter && shop.subcategory_id !== subcatFilter) return false;
  return true;
}

export async function ShopResultsList({ searchParams }: ShopResultsListProps) {
  const term = normalizeParam(searchParams.q);
  const typeRaw = normalizeParam(searchParams.type);
  const catRaw = normalizeParam(searchParams.cat);
  const subcatRaw = normalizeParam(searchParams.subcat);

  const typeFilter =
    typeRaw && typeRaw !== "all" && isActiveType(typeRaw) ? typeRaw : "";
  const catFilter =
    catRaw && catRaw !== "all" && isUuid(catRaw) ? catRaw : "";
  const subcatFilter =
    subcatRaw && subcatRaw !== "all" && isUuid(subcatRaw) ? subcatRaw : "";

  const supabase = await createClient();

  let categoryLabel: string | null = null;
  if (catFilter) {
    const { data: catRow } = await supabase
      .from("categories")
      .select("name")
      .eq("id", catFilter)
      .maybeSingle();
    categoryLabel = catRow?.name ?? null;
  }

  let subcategoryLabel: string | null = null;
  if (subcatFilter) {
    const { data: subRow } = await supabase
      .from("subcategories")
      .select("name")
      .eq("id", subcatFilter)
      .maybeSingle();
    subcategoryLabel = subRow?.name ?? null;
  }

  const safeTerm = term.replace(/[%_,]/g, " ").trim();
  const appliesTextFilter = term.length > 0 && safeTerm.length > 0;
  const hasActiveFilters =
    appliesTextFilter ||
    Boolean(subcatFilter) ||
    Boolean(catFilter) ||
    Boolean(typeFilter);

  function buildShopsQuery() {
    let q = supabase.from("shops").select("*").order("created_at", { ascending: false });

    if (typeFilter) {
      q = q.eq("business_type", typeFilter);
    }
    if (catFilter) {
      q = q.eq("category_id", catFilter);
    }
    if (subcatFilter) {
      q = q.eq("subcategory_id", subcatFilter);
    }
    if (appliesTextFilter) {
      q = q.or(`name.ilike.%${safeTerm}%,description.ilike.%${safeTerm}%`);
    }
    return q;
  }

  let shopRows: unknown[] | null = null;
  let shopError: { message: string } | null = null;
  let listingRowsForUi: Array<{
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    discount_percentage: number | null;
    image_urls: Json;
    shop_id: string;
    shops: unknown;
  }> = [];

  if (appliesTextFilter) {
    const shopsQuery = buildShopsQuery().limit(RESULT_LIMIT_FILTERED);
    const listingsQuery = supabase
      .from("listings")
      .select(
        `
        id,
        title,
        description,
        price,
        discount_percentage,
        image_urls,
        shop_id,
        created_at,
        shops ( name, slug, logo_url, business_type, category_id, subcategory_id )
      `,
      )
      .or(`title.ilike.%${safeTerm}%,description.ilike.%${safeTerm}%`)
      .order("created_at", { ascending: false })
      .limit(LISTINGS_FETCH_CAP);

    const [shopsRes, listingsRes] = await Promise.all([shopsQuery, listingsQuery]);

    shopError = shopsRes.error;
    shopRows = shopsRes.data;

    if (listingsRes.error) {
      listingRowsForUi = [];
    } else {
      const raw = (listingsRes.data ?? []) as typeof listingRowsForUi;
      listingRowsForUi = raw.filter((row) => {
        const sh = unwrapShopEmbed(row.shops);
        if (!sh) return false;
        return shopMatchesExploreFilters(sh, typeFilter, catFilter, subcatFilter);
      });
      listingRowsForUi = listingRowsForUi.slice(0, RESULT_LIMIT_FILTERED);
    }
  } else {
    const q = buildShopsQuery();
    const limited = hasActiveFilters
      ? q.limit(RESULT_LIMIT_FILTERED)
      : q.limit(RESULT_LIMIT_DEFAULT);
    const res = await limited;
    shopError = res.error;
    shopRows = res.data;
  }

  const shops: ShopCardShop[] =
    (shopRows as Record<string, unknown>[] | null)?.map((s) => ({
      id: String(s.id),
      name: String(s.name),
      slug: String(s.slug),
      description: (s.description as string | null) ?? null,
      logo_url: (s.logo_url as string | null) ?? null,
      whatsapp_number: (s.whatsapp_number as string | null) ?? null,
    })) ?? [];

  let heading: string;
  let subheading: string | null = null;

  if (!hasActiveFilters) {
    heading = "Destacados";
    subheading = "Comercios recientes en el directorio";
  } else {
    const filterBits: string[] = [];
    if (typeFilter) {
      filterBits.push(typeFilter === "producto" ? "Productos" : "Servicios");
    }
    if (categoryLabel) filterBits.push(categoryLabel);
    if (subcategoryLabel) filterBits.push(subcategoryLabel);

    if (appliesTextFilter) {
      heading = `Resultados para “${safeTerm}”`;
      subheading = filterBits.length > 0 ? filterBits.join(" · ") : null;
    } else {
      heading = "Resultados";
      subheading = filterBits.length > 0 ? filterBits.join(" · ") : null;
    }
  }

  const showMarketplaceLayout = appliesTextFilter;
  const hasListings = listingRowsForUi.length > 0;
  const totalTextHitsEmpty =
    appliesTextFilter && shops.length === 0 && !hasListings && !shopError;

  return (
    <section
      id="comercios"
      className="scroll-mt-24 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm sm:p-6"
      aria-labelledby="resultados-titulo"
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="resultados-titulo" className="text-xl font-semibold text-zinc-900">
            {heading}
          </h2>
          {subheading && <p className="mt-1 text-sm text-zinc-600">{subheading}</p>}
        </div>
      </div>

      {shopError ? (
        <Card className="border border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle>No pudimos cargar resultados</CardTitle>
            <CardDescription>
              Verificá la conexión y las políticas RLS en Supabase.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : showMarketplaceLayout ? (
        totalTextHitsEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-slate-50/80 px-6 py-16 text-center">
            <p className="max-w-md text-lg text-zinc-600">
              No encontramos nada para tu búsqueda
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              Limpiar filtros
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-zinc-900">Locales</h3>
              {shops.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {shops.map((shop) => (
                    <ShopCard key={shop.id} shop={shop} variant="directory" />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  No encontramos locales con este nombre
                </p>
              )}
            </div>

            {hasListings && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-900">
                  Productos y servicios
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {listingRowsForUi
                    .map((row) => {
                      const sh = unwrapShopEmbed(row.shops);
                      return sh?.slug ? { row, sh } : null;
                    })
                    .filter((x): x is NonNullable<typeof x> => x != null)
                    .map(({ row, sh }) => (
                      <SearchListingCard
                        key={row.id}
                        title={row.title}
                        price={row.price}
                        imageUrls={row.image_urls}
                        shopName={sh.name}
                        shopSlug={sh.slug}
                        shopLogoUrl={sh.logo_url}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )
      ) : shops.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} variant="directory" />
          ))}
        </div>
      ) : hasActiveFilters ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-slate-50/80 px-6 py-16 text-center">
          <p className="max-w-md text-lg text-zinc-600">
            No encontramos locales que coincidan con tu búsqueda
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            Limpiar filtros
          </Link>
        </div>
      ) : (
        <Card className="border border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>Estamos creciendo</CardTitle>
            <CardDescription>
              Estamos sumando los primeros comercios de la ciudad. ¡Volvé pronto o registrá el
              tuyo desde el panel de vendedores!
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </section>
  );
}

/** Skeleton de la grilla de resultados (home). */
export function ShopResultsListSkeleton() {
  return (
    <section
      className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm sm:p-6"
      aria-hidden
    >
      <div className="mb-6 h-8 max-w-xs animate-pulse rounded-md bg-zinc-200" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-xl border border-zinc-100 bg-zinc-100/80"
          />
        ))}
      </div>
    </section>
  );
}

/** Alias pedido para el fallback de Suspense en la home. */
export const SkeletonGrid = ShopResultsListSkeleton;
