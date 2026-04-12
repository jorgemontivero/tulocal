import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
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
import { ListingGallery } from "@/components/listing-gallery";
import { createClient } from "@/utils/supabase/server";
import { cn } from "@/lib/utils";
import {
  listingOriginalBeforeDiscount,
  listingShowsConsultar,
} from "@/lib/listing-display";

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

function instagramProfileUrl(raw: string | null | undefined): string | null {
  const u = String(raw ?? "")
    .trim()
    .replace(/^@/, "")
    .replace(/\/+$/, "");
  if (!u) return null;
  return `https://www.instagram.com/${encodeURIComponent(u)}/`;
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
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
    .select("id,name,category,description,logo_url,whatsapp_number,instagram_username")
    .eq("slug", slug)
    .maybeSingle();

  if (!shop) {
    notFound();
  }

  const instagramUrl = instagramProfileUrl(
    (shop as { instagram_username?: string | null }).instagram_username,
  );

  const { data: listings } = await supabase
    .from("listings")
    .select("id,title,description,price,discount_percentage,is_promoted,image_urls")
    .eq("shop_id", shop.id)
    .order("is_promoted", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Avatar className="size-24 shrink-0 ring-2 ring-zinc-200/90 ring-offset-2 ring-offset-white md:size-32">
                {shop.logo_url && (
                  <AvatarImage src={shop.logo_url} alt={`Logo de ${shop.name}`} className="object-cover" />
                )}
                <AvatarFallback className="bg-slate-100 text-3xl font-semibold text-slate-700 md:text-4xl">
                  {shop.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-center sm:text-left">
                <CardTitle className="text-2xl text-slate-900 sm:text-3xl">{shop.name}</CardTitle>
                <CardDescription className="mt-1 text-base text-slate-700">
                  {shop.category ?? "Comercio local"} {shop.description ? `· ${shop.description}` : ""}
                </CardDescription>
              </div>
            </div>

            {(shop.whatsapp_number || instagramUrl) ? (
              <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-end">
                {shop.whatsapp_number ? (
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
                ) : null}
                {instagramUrl ? (
                  <Button
                    render={
                      <a href={instagramUrl} target="_blank" rel="noopener noreferrer" />
                    }
                    variant="outline"
                    className="border-fuchsia-500 text-fuchsia-700 hover:bg-fuchsia-50"
                  >
                    <InstagramIcon className="size-4" />
                    Instagram
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CardHeader>
        </Card>

        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((item) => {
              const priceVal =
                item.price == null ? null : Number(item.price);
              const disc =
                item.discount_percentage == null
                  ? null
                  : Number(item.discount_percentage);
              const showConsultar = listingShowsConsultar(priceVal);
              const showOffer =
                !showConsultar &&
                disc != null &&
                disc > 0 &&
                priceVal != null;

              return (
                <Card
                  key={item.id}
                  className={cn(
                    "relative overflow-hidden",
                    item.is_promoted
                      ? "border-2 border-emerald-600 bg-emerald-50"
                      : "border border-zinc-200 bg-white",
                  )}
                >
                  {item.is_promoted && (
                    <Badge className="absolute top-2 right-2 z-10 bg-emerald-700 text-white hover:bg-emerald-700">
                      Destacado
                    </Badge>
                  )}
                  {showOffer && (
                    <Badge className="absolute top-2 left-2 z-10 bg-orange-600 text-white hover:bg-orange-600">
                      Oferta {disc}%
                    </Badge>
                  )}

                  <ListingGallery imageUrls={item.image_urls} />

                  <CardHeader>
                    <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {item.description ?? "Sin descripcion"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {showConsultar ? (
                      <p className="font-bold text-emerald-800">Consultar precio</p>
                    ) : showOffer && priceVal != null ? (
                      <div className="space-y-1">
                        <p className="text-sm text-zinc-500 line-through">
                          {formatARS(
                            listingOriginalBeforeDiscount(priceVal, disc ?? 0),
                          )}
                        </p>
                        <p className="font-semibold text-emerald-700">
                          {formatARS(priceVal)}
                        </p>
                      </div>
                    ) : priceVal != null ? (
                      <p className="font-semibold text-emerald-700">{formatARS(priceVal)}</p>
                    ) : (
                      <p className="font-bold text-emerald-800">Consultar precio</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
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
