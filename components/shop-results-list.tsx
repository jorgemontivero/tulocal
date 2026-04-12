import { MessageCircle } from "lucide-react";
import {
  Card,
  CardContent,
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

export type ShopResultsListProps = {
  q?: string;
  type?: string;
  cat?: string;
  subcat?: string;
};

export async function ShopResultsList({
  q = "",
  type = "",
  cat = "",
  subcat = "",
}: ShopResultsListProps) {
  const term = q.trim();
  const typeRaw = type.trim();
  const catRaw = cat.trim();
  const subcatRaw = subcat.trim();

  const validType =
    typeRaw === "producto" || typeRaw === "servicio" ? typeRaw : "";
  const validCat = isUuid(catRaw) ? catRaw : "";
  const validSubcat = isUuid(subcatRaw) ? subcatRaw : "";

  const supabase = await createClient();

  let categoryLabel: string | null = null;
  if (validCat) {
    const { data: catRow } = await supabase
      .from("categories")
      .select("name")
      .eq("id", validCat)
      .maybeSingle();
    categoryLabel = catRow?.name ?? null;
  }

  let subcategoryLabel: string | null = null;
  if (validSubcat) {
    const { data: subRow } = await supabase
      .from("subcategories")
      .select("name")
      .eq("id", validSubcat)
      .maybeSingle();
    subcategoryLabel = subRow?.name ?? null;
  }

  const safeTerm = term.replace(/[%_,]/g, " ").trim();
  const appliesTextFilter = term.length > 0 && safeTerm.length > 0;
  const hasActiveFilters =
    appliesTextFilter || validSubcat.length > 0 || validCat.length > 0 || validType.length > 0;

  let query = supabase
    .from("shops")
    .select("id,name,slug,description,logo_url,whatsapp_number")
    .order("created_at", { ascending: false });

  if (appliesTextFilter) {
    query = query.or(`name.ilike.%${safeTerm}%,description.ilike.%${safeTerm}%`);
  }

  if (validSubcat) {
    query = query.eq("subcategory_id", validSubcat);
  } else if (validCat) {
    query = query.eq("category_id", validCat);
  }

  /** Solo con `type` en la URL (pestañas del home); enlaces viejos con solo `cat` no fuerzan rubro. */
  if (validType) {
    query = query.eq("business_type", validType);
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
    if (validType) {
      filterBits.push(validType === "producto" ? "Productos" : "Servicios");
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      ) : hasActiveFilters ? (
        <Card className="border border-dashed border-zinc-200 bg-slate-50/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">No hay resultados</CardTitle>
            <CardDescription className="text-base text-zinc-600">
              Probá con otros filtros, otra búsqueda o explorá otra categoría.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 text-sm text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="size-4 text-emerald-600" aria-hidden />
              Ajustá la búsqueda o los filtros de arriba para ver más comercios.
            </span>
          </CardContent>
        </Card>
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

export function ShopResultsListSkeleton() {
  return (
    <section
      className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm sm:p-6"
      aria-hidden
    >
      <div className="mb-6 h-8 max-w-xs animate-pulse rounded-md bg-zinc-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border border-zinc-100 bg-zinc-100/80"
          />
        ))}
      </div>
    </section>
  );
}
