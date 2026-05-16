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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CatalogManager, type ListingItem } from "@/app/dashboard/catalog-manager";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/utils/supabase/server";
import { PLAN_LABELS } from "@/lib/admin";
import { parseListingImageUrls } from "@/lib/listing-display";
import { ShopDescription } from "@/components/shop-description";
import { canShopPlanUseFlyers, getShopFlyerLimitByPlan } from "@/lib/shop-flyers";
import { ShopCard, type ShopCardShop } from "@/components/shop-card";
import { Heart, LayoutDashboard, Store, LogOut } from "lucide-react";
import { fetchShopTaxonomy } from "@/lib/shop-taxonomy";

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
  const metadata = user.user_metadata ?? {};

  const nombre = String(metadata.nombre ?? "").trim();
  const apellido = String(metadata.apellido ?? "").trim();
  const nombreLocal = [nombre, apellido].filter(Boolean).join(" ");
  if (nombreLocal) return nombreLocal;

  const fullName = String(metadata.full_name ?? metadata.name ?? "").trim();
  if (fullName) return fullName;

  const givenName = String(metadata.given_name ?? "").trim();
  const familyName = String(metadata.family_name ?? "").trim();
  const oauthName = [givenName, familyName].filter(Boolean).join(" ");
  if (oauthName) return oauthName;

  return user.email || "Usuario";
}

function FavoritesSection({ shops }: { shops: ShopCardShop[] }) {
  return (
    <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Heart className="size-5 text-rose-500" />
          <CardTitle className="text-xl text-slate-900 dark:text-zinc-100">Mis Favoritos</CardTitle>
        </div>
        <CardDescription className="text-slate-700 dark:text-zinc-300">
          Comercios que guardaste para volver a ver.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {shops.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Todavía no guardaste ningún comercio. Explorá el{" "}
            <Link href="/" className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700 dark:text-emerald-400">
              directorio
            </Link>{" "}
            o el{" "}
            <Link href="/mapa" className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700 dark:text-emerald-400">
              mapa
            </Link>{" "}
            y guardá los que te interesen.
          </p>
        ) : (
          <div className="space-y-3">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
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

  const { data: favoritesRaw } = await supabase
    .from("favorites")
    .select("shop:shop_id(id, name, slug, description, logo_url, whatsapp_number, plan_type)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const favoriteShops: ShopCardShop[] = (favoritesRaw ?? [])
    .map((f) => f.shop as ShopCardShop | null)
    .filter((s): s is ShopCardShop => s !== null);

  const shopRow = shop as {
    id: string;
    name: string;
    whatsapp_number?: string | null;
    logo_url?: string | null;
    slug?: string | null;
    category?: string | null;
    category_id?: string | null;
    subcategory_id?: string | null;
    business_type?: string | null;
    instagram_username?: string | null;
    description?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    plan_type?: string | null;
    flyer_urls?: unknown;
  } | null;

  const whatsapp = shopRow?.whatsapp_number ?? null;
  const logoUrl = shopRow?.logo_url ?? null;
  const shopSlug = shopRow?.slug ?? null;
  const initial = (shopRow?.name ?? "L").slice(0, 1).toUpperCase();
  const rubroLabel = shopRow?.category?.trim() || "Sin rubro indicado";
  const tipoNegocioLabel =
    shopRow?.business_type === "servicio"
      ? "Servicios"
      : shopRow?.business_type === "producto"
        ? "Venta de productos"
        : "Sin tipo indicado";
  const instagramHandle = shopRow?.instagram_username?.trim();
  const planLabel = PLAN_LABELS[shopRow?.plan_type ?? ""] ?? shopRow?.plan_type ?? "—";
  const hasMapCoords =
    shopRow?.latitude != null &&
    shopRow?.longitude != null &&
    Number.isFinite(Number(shopRow?.latitude)) &&
    Number.isFinite(Number(shopRow?.longitude));
  const addressLine = shopRow?.address?.trim();
  const ubicacionResumen = addressLine
    ? addressLine
    : hasMapCoords
      ? "Ubicación en mapa (sin dirección escrita)"
      : "Sin ubicación en el mapa";
  const maxFlyersForPlan = getShopFlyerLimitByPlan(shopRow?.plan_type ?? null);
  const canUseFlyers = canShopPlanUseFlyers(shopRow?.plan_type ?? null);
  const flyerCount = canUseFlyers ? parseListingImageUrls(shopRow?.flyer_urls).length : 0;

  let listings: any[] = [];
  let taxonomy: any = null;

  if (shop) {
    const [{ data: listingsData }, taxonomyData] = await Promise.all([
      supabase
        .from("listings")
        .select("id,title,description,price,discount_percentage,is_promoted,image_urls,status,category_id,subcategory_id,subcategory_note")
        .eq("shop_id", shop.id)
        .neq("status", "blocked")
        .order("is_promoted", { ascending: false })
        .order("created_at", { ascending: false }),
      fetchShopTaxonomy(supabase),
    ]);
    listings = listingsData ?? [];
    taxonomy = taxonomyData;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      <Tabs defaultValue="resumen" orientation="vertical" className="flex flex-col md:flex-row w-full min-h-screen">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex flex-col p-4 md:sticky md:top-0 md:h-screen z-10">
          <Link
            href="/"
            className="mb-8 flex items-center gap-3 rounded-lg outline-offset-4 hover:opacity-90 px-2 mt-2"
          >
            <Image
              src="/logo-tulocal.png"
              alt=""
              width={200}
              height={48}
              className="h-8 w-auto object-contain"
            />
            <span
              className={`${brandSans.className} text-xl font-extrabold italic tracking-tight text-slate-900 dark:text-zinc-100`}
            >
              Tu Local
            </span>
          </Link>

          <TabsList className="flex flex-col h-auto w-full items-start justify-start bg-transparent p-0 space-y-2">
            <TabsTrigger value="resumen" className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium">
              <LayoutDashboard className="size-5" />
              Resumen
            </TabsTrigger>
            {shop && (
              <TabsTrigger value="catalogo" className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium">
                <Store className="size-5" />
                Mi Catálogo
              </TabsTrigger>
            )}
            <TabsTrigger value="favoritos" className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium">
              <Heart className="size-5" />
              Favoritos
            </TabsTrigger>
          </TabsList>

          <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <form action={signOutAndRedirect}>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start gap-3 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 font-medium"
              >
                <LogOut className="size-5" />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto w-full">
          <div className="mx-auto max-w-4xl space-y-6">
            <header className="mb-8">
               <h1 className="text-3xl font-bold text-slate-900 dark:text-zinc-100">
                 Hola, {saludoNombreUsuario(user)}
               </h1>
               <p className="text-slate-600 dark:text-zinc-400 mt-1">Gestiona tu presencia en tulocal.com.ar.</p>
            </header>

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

            <TabsContent value="resumen" className="mt-0 outline-none space-y-6">
              {!shop ? (
                <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-xl text-slate-900 dark:text-zinc-100">
                      Aún no tenés comercios
                    </CardTitle>
                    <CardDescription className="text-base text-slate-700 dark:text-zinc-300">
                      Cuando crees tu primer local vas a poder editarlo, sumar productos al catalogo y
                      aparecer en el directorio.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      render={<Link href="/dashboard/nuevo" />}
                      nativeButton={false}
                      size="lg"
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Crear mi primer local
                    </Button>
                  </CardContent>
                </Card>
              ) : (
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
                      <Avatar className="size-28 sm:size-32">
                        {logoUrl && <AvatarImage src={logoUrl} alt={`Logo de ${shopRow?.name}`} />}
                        <AvatarFallback className="bg-slate-100 text-3xl font-semibold text-slate-700 sm:text-4xl dark:bg-zinc-800 dark:text-zinc-200">
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-zinc-300">Nombre</p>
                    <p className="font-semibold text-slate-900 dark:text-zinc-100">{shopRow?.name}</p>

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
                    {shopRow?.description?.trim() ? (
                      <ShopDescription
                        markdown={shopRow.description}
                        className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-slate-900 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100"
                      />
                    ) : (
                      <p className="text-sm text-slate-900 dark:text-zinc-100">Sin descripción</p>
                    )}

                    <p className="text-sm text-slate-700 dark:text-zinc-300">Ubicación</p>
                    <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-zinc-100">
                      {ubicacionResumen}
                    </p>

                    {canUseFlyers && (
                      <>
                        <p className="text-sm text-slate-700 dark:text-zinc-300">
                          Flyers en el catálogo (máx. {maxFlyersForPlan})
                        </p>
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
              )}
            </TabsContent>

            {shop && (
              <TabsContent value="catalogo" className="mt-0 outline-none">
                <CatalogManager
                  listings={(listings ?? []) as ListingItem[]}
                  shopCategoryId={shopRow?.category_id ?? undefined}
                  shopSubcategoryId={shopRow?.subcategory_id ?? undefined}
                  shopBusinessType={
                    shopRow?.business_type === "producto" || shopRow?.business_type === "servicio"
                      ? shopRow?.business_type
                      : undefined
                  }
                  taxonomy={taxonomy as any}
                />
              </TabsContent>
            )}

            <TabsContent value="favoritos" className="mt-0 outline-none">
              <FavoritesSection shops={favoriteShops} />
            </TabsContent>
          </div>
        </main>
      </Tabs>
    </div>
  );
}
