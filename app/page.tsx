import Link from "next/link";
import type { Metadata } from "next";
import { LayoutDashboard, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SearchBar } from "@/components/search-bar";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "tulocal.com.ar | Directorio comercial de Catamarca",
  description:
    "Encuentra comercios, productos y servicios locales en Catamarca. Potenciando el comercio local.",
  openGraph: {
    title: "tulocal.com.ar | Directorio comercial de Catamarca",
    description:
      "Encuentra comercios, productos y servicios locales en Catamarca. Potenciando el comercio local.",
    url: "/",
    siteName: "tulocal.com.ar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "tulocal.com.ar | Directorio comercial de Catamarca",
    description:
      "Encuentra comercios, productos y servicios locales en Catamarca. Potenciando el comercio local.",
  },
};

function shortDescription(description: string | null): string {
  if (!description) return "Comercio local de Catamarca.";
  return description.length > 110 ? `${description.slice(0, 110)}...` : description;
}

function rubroFromSlug(slug: string): string {
  const first = slug.split("-")[0];
  if (!first) return "Comercio";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function toWhatsAppUrl(whatsappNumber: string): string {
  const normalized = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${normalized}`;
}

type HomePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const supabase = await createClient();
  const { q = "" } = await searchParams;
  const term = q.trim();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let query = supabase
    .from("shops")
    .select("id,name,slug,description,category,whatsapp_number,logo_url")
    .order("created_at", { ascending: false });

  if (term) {
    const safeTerm = term.replace(/[%_,]/g, " ").trim();
    query = query.or(
      `name.ilike.%${safeTerm}%,category.ilike.%${safeTerm}%,description.ilike.%${safeTerm}%`,
    );
  }

  const { data: shops, error } = await query;

  const hasShops = !error && shops && shops.length > 0;
  const hasSingleShop = hasShops && shops.length === 1;

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
            tulocal.com.ar
          </Link>
          {user ? (
            <Button
              render={<Link href="/dashboard" />}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <LayoutDashboard />
              Mi Panel
            </Button>
          ) : (
            <Button
              render={<Link href="/login" />}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Acceso Vendedores
            </Button>
          )}
        </div>
      </header>

      <main>
        <section className="border-b border-zinc-200">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:py-14">
            <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Encontrá lo que buscás en Catamarca
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-600 sm:text-base">
              Descubrí comercios, servicios y oportunidades cerca tuyo.
            </p>
            <SearchBar />
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Comercios destacados</h2>
            <Badge className="bg-emerald-100 text-emerald-700">Catamarca</Badge>
          </div>

          {error ? (
            <Card className="border border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle>No pudimos cargar comercios</CardTitle>
                <CardDescription>
                  Verifica la conexion y las politicas RLS en Supabase.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : hasShops ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {shops.map((shop) => (
                  <Card key={shop.id} className="h-full border border-zinc-200 bg-white">
                    <CardHeader>
                      <div className="mb-2 flex items-center gap-3">
                        <Avatar className="size-10">
                          {shop.logo_url && (
                            <AvatarImage src={shop.logo_url} alt={`Logo de ${shop.name}`} />
                          )}
                          <AvatarFallback className="bg-slate-100 font-semibold text-slate-700">
                            {shop.name.slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <CardTitle className="line-clamp-1">{shop.name}</CardTitle>
                      </div>
                      <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                        {shortDescription(shop.description)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Badge className="bg-emerald-600 text-white">{rubroFromSlug(shop.slug)}</Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          render={<Link href={`/${shop.slug}`} />}
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Ver Catalogo
                        </Button>
                        {shop.whatsapp_number && (
                          <Button
                            render={
                              <a
                                href={toWhatsAppUrl(shop.whatsapp_number)}
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            }
                            variant="outline"
                            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                          >
                            <MessageCircle />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {hasSingleShop && (
                <p className="text-center text-sm font-medium text-slate-700">
                  No hay más comercios por ahora.
                </p>
              )}
            </div>
          ) : term ? (
            <Card className="border border-zinc-200 bg-white">
              <CardHeader>
                <CardTitle>Sin resultados</CardTitle>
                <CardDescription>
                  No encontramos comercios que coincidan con "{term}".
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card className="border border-zinc-200 bg-white">
              <CardHeader>
                <CardTitle>Estamos creciendo</CardTitle>
                <CardDescription>
                  Estamos sumando los primeros comercios de la ciudad. ¡Volvé
                  pronto!
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-4">
            <a className="hover:text-emerald-600" href="#">
              Inicio
            </a>
            <a className="hover:text-emerald-600" href="#">
              Comercios
            </a>
            <a className="hover:text-emerald-600" href="#">
              Contacto
            </a>
          </nav>
          <p>Potenciando el comercio local</p>
        </div>
      </footer>
    </div>
  );
}
