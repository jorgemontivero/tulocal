import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Poppins } from "next/font/google";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CatalogManager, type ListingItem } from "@/app/dashboard/catalog-manager";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/utils/supabase/server";
import { PLAN_LABELS } from "@/lib/admin";
import { parseListingImageUrls } from "@/lib/listing-display";

const brandSans = Poppins({
  subsets: ["latin"],
  weight: ["800"],
  style: ["italic"],
  display: "swap",
});

function saludoNombreUsuario(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): string {
  const nombre = String(user.user_metadata?.nombre ?? "").trim();
  const apellido = String(user.user_metadata?.apellido ?? "").trim();
  const armado = [nombre, apellido].filter(Boolean).join(" ");
  return armado || user.email || "Usuario";
}

type DashboardPageProps = {
  searchParams: Promise<{ success?: string }>;
};

async function signOutAndRedirect() {
  "use server";
  await signOut();
  redirect("/login");
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const params = await searchParams;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("*")
    .eq("vendor_id", user.id)
    .maybeSingle();

  if (shopError) {
    console.error("[dashboard] shop query:", shopError.message);
  }

  if (!shop) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-zinc-950">
        <div className="w-full max-w-xl space-y-4">
          <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <CardHeader className="space-y-2">
              <Link
                href="/"
                className="mb-1 flex items-center gap-3 rounded-lg outline-offset-4 hover:opacity-90"
              >
                <Image
                  src="/logo-tulocal.png"
                  alt=""
                  width={200}
                  height={48}
                  className="h-10 w-auto object-contain"
                />
                <span
                  className={`${brandSans.className} text-2xl font-extrabold italic tracking-tight text-slate-900 dark:text-zinc-100`}
                >
                  Tu Local
                </span>
              </Link>
              <CardTitle className="text-2xl text-slate-900 dark:text-zinc-100">
                Bienvenido, {saludoNombreUsuario(user)}
              </CardTitle>
              <CardDescription className="text-slate-700 dark:text-zinc-300">
                Gestiona tu presencia en tulocal.com.ar.
              </CardDescription>
            </CardHeader>
          </Card>

          <form action={signOutAndRedirect} className="flex justify-end">
            <Button
              type="submit"
              variant="outline"
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
            >
              Cerrar sesión
            </Button>
          </form>

          {params.success === "local-creado" && (
            <Card className="border border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/25">
              <CardContent className="pt-4 text-sm text-emerald-700 dark:text-emerald-200">
                Local guardado con exito.
              </CardContent>
            </Card>
          )}

          <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <CardHeader className="space-y-2 text-center sm:text-left">
              <CardTitle className="text-xl text-slate-900 dark:text-zinc-100">
                Aún no tenés comercios
              </CardTitle>
              <CardDescription className="text-base text-slate-700 dark:text-zinc-300">
                Cuando crees tu primer local vas a poder editarlo, sumar productos al catalogo y
                aparecer en el directorio.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-stretch gap-3 sm:items-start">
              <Button
                render={<Link href="/dashboard/nuevo" />}
                nativeButton={false}
                size="lg"
                className="h-12 w-full bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-700 sm:w-auto sm:min-w-[240px]"
              >
                Crear mi primer local
              </Button>
            </CardContent>
          </Card>

          <form action={signOutAndRedirect} className="pt-2">
            <Button
              type="submit"
              variant="outline"
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
            >
              Cerrar sesión
            </Button>
          </form>
        </div>
      </main>
    );
  }

  const shopRow = shop as {
    id: string;
    name: string;
    whatsapp_number?: string | null;
    logo_url?: string | null;
    slug?: string | null;
    category?: string | null;
    business_type?: string | null;
    instagram_username?: string | null;
    description?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    plan_type?: string | null;
    flyer_urls?: unknown;
  };

  const whatsapp = shopRow.whatsapp_number ?? null;
  const logoUrl = shopRow.logo_url ?? null;
  const shopSlug = shopRow.slug ?? null;
  const initial = (shopRow.name ?? "L").slice(0, 1).toUpperCase();
  const rubroLabel = shopRow.category?.trim() || "Sin rubro indicado";
  const tipoNegocioLabel =
    shopRow.business_type === "servicio"
      ? "Servicios"
      : shopRow.business_type === "producto"
        ? "Venta de productos"
        : "Sin tipo indicado";
  const instagramHandle = shopRow.instagram_username?.trim();
  const planLabel = PLAN_LABELS[shopRow.plan_type ?? ""] ?? shopRow.plan_type ?? "—";
  const hasMapCoords =
    shopRow.latitude != null &&
    shopRow.longitude != null &&
    Number.isFinite(Number(shopRow.latitude)) &&
    Number.isFinite(Number(shopRow.longitude));
  const addressLine = shopRow.address?.trim();
  const ubicacionResumen = addressLine
    ? addressLine
    : hasMapCoords
      ? "Ubicación en mapa (sin dirección escrita)"
      : "Sin ubicación en el mapa";
  const flyersPremium =
    shopRow.plan_type === "oro" || shopRow.plan_type === "black";
  const flyerCount = flyersPremium ? parseListingImageUrls(shopRow.flyer_urls).length : 0;
  const { data: listings } = await supabase
    .from("listings")
    .select("id,title,description,price,discount_percentage,is_promoted,image_urls,status")
    .eq("shop_id", shop.id)
    .neq("status", "blocked")
    .order("is_promoted", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-zinc-950">
      <div className="w-full max-w-xl space-y-4">
        <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <CardHeader className="space-y-2">
            <Link
              href="/"
              className="mb-1 flex items-center gap-3 rounded-lg outline-offset-4 hover:opacity-90"
            >
              <Image
                src="/logo-tulocal.png"
                alt=""
                width={200}
                height={48}
                className="h-10 w-auto object-contain"
              />
              <span
                className={`${brandSans.className} text-2xl font-extrabold italic tracking-tight text-slate-900 dark:text-zinc-100`}
              >
                Tu Local
              </span>
            </Link>
            <CardTitle className="text-2xl text-slate-900 dark:text-zinc-100">
              Bienvenido, {saludoNombreUsuario(user)}
            </CardTitle>
            <CardDescription className="text-slate-700 dark:text-zinc-300">
              Gestiona tu presencia en tulocal.com.ar.
            </CardDescription>
          </CardHeader>
        </Card>

        <form action={signOutAndRedirect} className="flex justify-end">
          <Button
            type="submit"
            variant="outline"
            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
          >
            Cerrar sesión
          </Button>
        </form>

        {params.success === "local-creado" && (
          <Card className="border border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/25">
            <CardContent className="pt-4 text-sm text-emerald-700 dark:text-emerald-200">
              Local guardado con exito.
            </CardContent>
          </Card>
        )}

        {params.success === "listing-actualizado" && (
          <Card className="border border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/25">
            <CardContent className="pt-4 text-sm text-emerald-700 dark:text-emerald-200">
              Producto actualizado correctamente.
            </CardContent>
          </Card>
        )}

        {params.success === "ubicacion-guardada" && (
          <Card className="border border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/25">
            <CardContent className="pt-4 text-sm text-emerald-700 dark:text-emerald-200">
              Ubicación guardada correctamente.
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                Resumen de tu local
              </CardTitle>
              <CardDescription className="text-slate-700 dark:text-zinc-300">
                Datos visibles para potenciales clientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="pb-2">
                <Avatar size="lg" className="size-28 sm:size-32">
                  {logoUrl && <AvatarImage src={logoUrl} alt={`Logo de ${shopRow.name}`} />}
                  <AvatarFallback className="bg-slate-100 text-3xl font-semibold text-slate-700 sm:text-4xl dark:bg-zinc-800 dark:text-zinc-200">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </div>
              <p className="text-sm text-slate-700 dark:text-zinc-300">Nombre</p>
              <p className="font-semibold text-slate-900 dark:text-zinc-100">{shopRow.name}</p>

              <p className="text-sm text-slate-700 dark:text-zinc-300">Rubro</p>
              <p className="font-semibold text-slate-900 dark:text-zinc-100">{rubroLabel}</p>

              <p className="text-sm text-slate-700 dark:text-zinc-300">Tipo de negocio</p>
              <p className="font-semibold text-slate-900 dark:text-zinc-100">{tipoNegocioLabel}</p>

              <p className="text-sm text-slate-700 dark:text-zinc-300">Plan</p>
              <p className="font-semibold text-slate-900 dark:text-zinc-100">{planLabel}</p>

              <p className="text-sm text-slate-700 dark:text-zinc-300">WhatsApp</p>
              <p className="font-semibold text-slate-900 dark:text-zinc-100">{whatsapp ?? "No configurado"}</p>

              <p className="text-sm text-slate-700 dark:text-zinc-300">Instagram</p>
              <p className="font-semibold text-slate-900 dark:text-zinc-100">
                {instagramHandle ? `@${instagramHandle}` : "No indicado"}
              </p>

              <p className="text-sm text-slate-700 dark:text-zinc-300">Descripción</p>
              <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-900 dark:text-zinc-100">
                {shopRow.description?.trim() || "Sin descripción"}
              </p>

              <p className="text-sm text-slate-700 dark:text-zinc-300">Ubicación</p>
              <p className="text-sm leading-snug text-slate-900 dark:text-zinc-100">{ubicacionResumen}</p>

              {flyersPremium && (
                <>
                  <p className="text-sm text-slate-700 dark:text-zinc-300">Flyers en el catálogo</p>
                  <p className="font-semibold text-slate-900 dark:text-zinc-100">
                    {flyerCount === 0
                      ? "Ninguno cargado"
                      : `${flyerCount} flyer${flyerCount === 1 ? "" : "s"}`}
                  </p>
                </>
              )}

              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
                <Button
                  render={<Link href="/dashboard/nuevo" />}
                  nativeButton={false}
                  variant="outline"
                  className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                >
                  Editar datos
                </Button>
                <Button
                  render={<Link href="/dashboard/ubicacion" />}
                  nativeButton={false}
                  variant="outline"
                  className="border-slate-400 text-slate-800 hover:bg-slate-50 dark:border-zinc-500 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Editar ubicación
                </Button>
                {shopSlug ? (
                  <Button
                    render={<Link href={`/${shopSlug}`} />}
                    nativeButton={false}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Ver mi catálogo público
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <CatalogManager listings={(listings ?? []) as ListingItem[]} />
        </div>

        <form action={signOutAndRedirect} className="pt-2">
          <Button
            type="submit"
            variant="outline"
            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
          >
            Cerrar sesión
          </Button>
        </form>
      </div>
    </main>
  );
}
