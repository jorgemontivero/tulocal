import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { ShopCard, type ShopCardShop } from "@/components/shop-card";

const RESULT_LIMIT_FILTERED = 48;
const RESULT_LIMIT_DEFAULT = 24;

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

  let query = supabase.from("shops").select("*").order("created_at", { ascending: false });

  if (typeFilter) {
    query = query.eq("business_type", typeFilter);
  }

  if (catFilter) {
    query = query.eq("category_id", catFilter);
  }

  if (subcatFilter) {
    query = query.eq("subcategory_id", subcatFilter);
  }

  if (appliesTextFilter) {
    query = query.or(`name.ilike.%${safeTerm}%,description.ilike.%${safeTerm}%`);
  }

  query = hasActiveFilters
    ? query.limit(RESULT_LIMIT_FILTERED)
    : query.limit(RESULT_LIMIT_DEFAULT);

  const { data: rows, error } = await query;

  const shops: ShopCardShop[] =
    rows?.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      logo_url: s.logo_url,
      whatsapp_number: s.whatsapp_number,
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

      {error ? (
        <Card className="border border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle>No pudimos cargar comercios</CardTitle>
            <CardDescription>
              Verificá la conexión y las políticas RLS en Supabase.
            </CardDescription>
          </CardHeader>
        </Card>
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
