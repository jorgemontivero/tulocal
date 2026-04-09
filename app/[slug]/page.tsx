import Link from "next/link";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";

type ShopPageProps = {
  params: Promise<{ slug: string }>;
};

function shortMetaDescription(description: string | null): string {
  if (!description) {
    return "Descubre productos y servicios de este comercio en tulocal.com.ar.";
  }
  return description.length > 150 ? `${description.slice(0, 150).trim()}...` : description;
}

function toWhatsAppUrl(whatsappNumber: string): string {
  return `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;
}

function formatARS(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

export async function generateMetadata(
  { params }: ShopPageProps,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("name,description,logo_url,slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!shop) {
    return {
      title: "No encontrado | tulocal.com.ar",
      description: "El comercio que buscas no esta disponible.",
      openGraph: {
        title: "No encontrado | tulocal.com.ar",
        description: "El comercio que buscas no esta disponible.",
        url: `/${slug}`,
      },
      twitter: {
        card: "summary",
        title: "No encontrado | tulocal.com.ar",
        description: "El comercio que buscas no esta disponible.",
      },
    };
  }

  const title = `${shop.name} | tulocal.com.ar`;
  const description = shortMetaDescription(shop.description);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${shop.slug}`,
      images: shop.logo_url ? [{ url: shop.logo_url }] : [],
    },
    twitter: {
      card: shop.logo_url ? "summary_large_image" : "summary",
      title,
      description,
      images: shop.logo_url ? [shop.logo_url] : undefined,
    },
  };
}

export default async function ShopCatalogPage({ params }: ShopPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("id,name,category,description,logo_url,whatsapp_number")
    .eq("slug", slug)
    .maybeSingle();

  if (!shop) {
    notFound();
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("id,title,description,price")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-14">
                {shop.logo_url && <AvatarImage src={shop.logo_url} alt={`Logo de ${shop.name}`} />}
                <AvatarFallback className="bg-slate-100 font-semibold text-slate-700">
                  {shop.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link href="/" className="text-sm font-semibold text-slate-900 hover:text-emerald-700">
                  tulocal.com.ar
                </Link>
                <CardTitle className="text-2xl text-slate-900">{shop.name}</CardTitle>
                <CardDescription className="text-slate-700">
                  {shop.category ?? "Comercio local"} {shop.description ? `· ${shop.description}` : ""}
                </CardDescription>
              </div>
            </div>

            {shop.whatsapp_number && (
              <Button
                render={
                  <a
                    href={toWhatsAppUrl(shop.whatsapp_number)}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <MessageCircle />
                WhatsApp
              </Button>
            )}
          </CardHeader>
        </Card>

        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((item) => (
              <Card key={item.id} className="border border-zinc-200 bg-white">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{item.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {item.description ?? "Sin descripcion"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-emerald-700">{formatARS(item.price)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border border-zinc-200 bg-white">
            <CardHeader>
              <CardTitle>Catalogo en preparacion</CardTitle>
              <CardDescription>
                Este comercio todavia no publico items en su catalogo.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </main>
  );
}
