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

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const params = await searchParams;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("vendor_id", user.id)
    .maybeSingle();

  const whatsapp =
    (shop as { whatsapp_number?: string | null } | null)?.whatsapp_number ?? null;
  const logoUrl = (shop as { logo_url?: string | null } | null)?.logo_url ?? null;
  const shopSlug = (shop as { slug?: string | null } | null)?.slug ?? null;
  const initial = (shop?.name ?? "L").slice(0, 1).toUpperCase();
  const { data: listings } = shop
    ? await supabase
        .from("listings")
        .select(
          "id,title,description,price,discount_percentage,is_promoted,image_urls,status",
        )
        .eq("shop_id", shop.id)
        .neq("status", "blocked")
        .order("is_promoted", { ascending: false })
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl space-y-4">
        <Card className="border border-zinc-200 bg-white shadow-sm">
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
                className={`${brandSans.className} text-2xl font-extrabold italic tracking-tight text-slate-900`}
              >
                Tu Local
              </span>
            </Link>
            <CardTitle className="text-2xl text-slate-900">
              Bienvenido, {saludoNombreUsuario(user)}
            </CardTitle>
            <CardDescription className="text-slate-700">
              Gestiona tu presencia en tulocal.com.ar.
            </CardDescription>
          </CardHeader>
        </Card>

        {params.success === "local-creado" && (
          <Card className="border border-emerald-200 bg-emerald-50">
            <CardContent className="pt-4 text-sm text-emerald-700">
              Local guardado con exito.
            </CardContent>
          </Card>
        )}

        {params.success === "listing-actualizado" && (
          <Card className="border border-emerald-200 bg-emerald-50">
            <CardContent className="pt-4 text-sm text-emerald-700">
              Producto actualizado correctamente.
            </CardContent>
          </Card>
        )}

        {!shop ? (
          <Card className="border border-zinc-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Todavia no registraste tu local</CardTitle>
              <CardDescription className="text-slate-700">
                Completando unos pocos datos ya podras aparecer en el directorio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                render={
                  <Link href="/dashboard/nuevo" />
                }
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Configurar mi Local
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="border border-zinc-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Resumen de tu local
                </CardTitle>
                <CardDescription className="text-slate-700">Datos visibles para potenciales clientes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="pb-2">
                  <Avatar size="lg" className="size-16">
                    {logoUrl && <AvatarImage src={logoUrl} alt={`Logo de ${shop.name}`} />}
                    <AvatarFallback className="bg-slate-100 font-semibold text-slate-700">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <p className="text-sm text-slate-700">Nombre</p>
                <p className="font-semibold text-slate-900">{shop.name}</p>

                <p className="text-sm text-slate-700">WhatsApp</p>
                <p className="font-semibold text-slate-900">{whatsapp ?? "No configurado"}</p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    render={
                      <Link href="/dashboard/nuevo" />
                    }
                    variant="outline"
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  >
                    Editar Datos
                  </Button>
                  {shopSlug ? (
                    <Button
                      render={<Link href={`/${shopSlug}`} />}
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
        )}

        <form
          action={async () => {
            "use server";
            await signOut();
            redirect("/login");
          }}
          className="pt-2"
        >
          <Button
            type="submit"
            variant="outline"
            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
          >
            Cerrar Sesion
          </Button>
        </form>
      </div>
    </main>
  );
}