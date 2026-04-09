import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CatalogManager } from "@/app/dashboard/catalog-manager";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/utils/supabase/server";

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
  const initial = (shop?.name ?? "L").slice(0, 1).toUpperCase();
  const { data: listings } = shop
    ? await supabase
        .from("listings")
        .select("id,title,description,price")
        .eq("shop_id", shop.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl space-y-4">
        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardHeader>
            <Link href="/" className="text-sm font-semibold text-slate-900 hover:text-emerald-700">
              tulocal.com.ar
            </Link>
            <CardTitle className="text-2xl text-slate-900">Bienvenido, {user.email}</CardTitle>
            <CardDescription className="text-slate-700">Gestiona tu presencia en tulocal.com.ar.</CardDescription>
          </CardHeader>
        </Card>

        {params.success === "local-creado" && (
          <Card className="border border-emerald-200 bg-emerald-50">
            <CardContent className="pt-4 text-sm text-emerald-700">
              Local guardado con exito.
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
                <CardTitle className="text-slate-900">Resumen de tu local</CardTitle>
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

                <Button
                  render={
                    <Link href="/dashboard/nuevo" />
                  }
                  variant="outline"
                  className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                >
                  Editar Datos
                </Button>
              </CardContent>
            </Card>

            <CatalogManager listings={listings ?? []} />
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