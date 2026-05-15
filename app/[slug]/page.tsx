import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Navigation } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabasePublic } from "@/utils/supabase/public";
import { StorefrontGridLoadMore } from "@/components/storefront-grid-load-more";
import type { StorefrontListing } from "@/app/actions/load-more-listings";
import { LISTINGS_PAGE_SIZE } from "@/lib/constants";
import { SiteFooter } from "@/components/site-footer";
import { parseListingImageUrls } from "@/lib/listing-display";
import { ShopFlyersCarousel } from "@/components/shop-flyers-carousel";
import { ShopDescription } from "@/components/shop-description";
import { markdownToPlainText } from "@/lib/shop-description";
import { getShopFlyerLimitByPlan } from "@/lib/shop-flyers";
import { ContactButtons } from "@/app/[slug]/contact-buttons";
import { FavoriteButton } from "@/components/favorite-button";

const SITE_URL = "https://tulocal.com.ar";

type ShopPageProps = {
  params: Promise<{ slug: string }>;
};

// Revalidate cache every 1 hour (ISR)
export const revalidate = 3600;

function shortMetaDescription(
  name: string,
  category: string | null,
  description: string | null,
  address: string | null,
): string {
  const parts: string[] = [];
  if (description) {
    const plainDescription = markdownToPlainText(description);
    const excerpt =
      plainDescription.length > 120
        ? `${plainDescription.slice(0, 120).trim()}…`
        : plainDescription;
    parts.push(excerpt);
  }
  if (address) parts.push(`Dirección: ${address}.`);
  if (parts.length === 0) {
    return `Descubrí los productos y servicios de ${name}${category ? ` (${category})` : ""} en Catamarca — tulocal.com.ar.`;
  }
  return parts.join(" ");
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


function buildLocalBusinessJsonLd(shop: {
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  logo_url: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  whatsapp_number: string | null;
}) {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: shop.name,
    url: `${SITE_URL}/${shop.slug}`,
  };
  if (shop.description) ld.description = shop.description;
  if (shop.logo_url) ld.image = shop.logo_url;
  if (shop.address) {
    ld.address = {
      "@type": "PostalAddress",
      streetAddress: shop.address,
      addressLocality: "San Fernando del Valle de Catamarca",
      addressRegion: "Catamarca",
      addressCountry: "AR",
    };
  }
  if (shop.latitude != null && shop.longitude != null) {
    ld.geo = {
      "@type": "GeoCoordinates",
      latitude: shop.latitude,
      longitude: shop.longitude,
    };
  }
  if (shop.whatsapp_number) {
    const num = shop.whatsapp_number.replace(/\D/g, "");
    ld.telephone = `+${num}`;
    ld.contactPoint = {
      "@type": "ContactPoint",
      telephone: `+${num}`,
      contactType: "customer service",
      availableLanguage: "es",
    };
  }
  if (shop.category) ld.additionalType = shop.category;
  return ld;
}

export async function generateMetadata(
  { params }: ShopPageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = supabasePublic;

  const { data: shop } = await supabase
    .from("shops")
    .select("name,description,logo_url,slug,category,address")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (!shop) {
    return {
      title: "No encontrado",
      description: "El comercio que buscás no está disponible.",
    };
  }

  const category = shop.category as string | null;
  const address = shop.address as string | null;

  const title = category
    ? `${shop.name} — ${category} en Catamarca`
    : shop.name;

  const description = shortMetaDescription(
    shop.name,
    category,
    shop.description,
    address,
  );

  const canonicalUrl = `${SITE_URL}/${shop.slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      siteName: "tulocal.com.ar",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ShopCatalogPage({ params }: ShopPageProps) {
  const { slug } = await params;
  const supabase = supabasePublic;

  const { data: shop } = await supabase
    .from("shops")
    .select("id,name,category,description,logo_url,flyer_urls,plan_type,whatsapp_number,instagram_username,address,latitude,longitude")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (!shop) {
    notFound();
  }

  const instagramUrl = instagramProfileUrl(
    (shop as { instagram_username?: string | null }).instagram_username,
  );

  const hasCoordinates =
    shop.latitude != null && shop.longitude != null;
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`
    : null;
  const embedMapUrl = hasCoordinates
    ? `https://maps.google.com/maps?q=${shop.latitude},${shop.longitude}&z=16&output=embed`
    : null;
  const maxFlyersForPlan = getShopFlyerLimitByPlan(
    (shop as { plan_type?: string | null }).plan_type,
  );
  const flyerUrls = parseListingImageUrls(
    (shop as { flyer_urls?: unknown }).flyer_urls,
  ).slice(0, maxFlyersForPlan);

  const { data: listingsRaw } = await supabase
    .from("listings")
    .select("id,title,description,price,discount_percentage,is_promoted,image_urls")
    .eq("shop_id", shop.id)
    .eq("status", "approved")
    .order("is_promoted", { ascending: false })
    .order("created_at", { ascending: false })
    .range(0, LISTINGS_PAGE_SIZE - 1);

  const listings: StorefrontListing[] =
    listingsRaw?.map((l) => ({
      id: String(l.id),
      title: String(l.title),
      description: (l.description as string | null) ?? null,
      price: l.price != null ? Number(l.price) : null,
      discount_percentage:
        l.discount_percentage != null ? Number(l.discount_percentage) : null,
      is_promoted: Boolean(l.is_promoted),
      image_urls: l.image_urls,
    })) ?? [];

  const hasMoreListings = (listingsRaw?.length ?? 0) === LISTINGS_PAGE_SIZE;

  const jsonLd = buildLocalBusinessJsonLd({
    name: shop.name,
    slug,
    description: shop.description ? markdownToPlainText(shop.description) : null,
    category: shop.category as string | null,
    logo_url: shop.logo_url,
    address: shop.address as string | null,
    latitude: shop.latitude != null ? Number(shop.latitude) : null,
    longitude: shop.longitude != null ? Number(shop.longitude) : null,
    whatsapp_number: shop.whatsapp_number,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Avatar className="size-24 shrink-0 ring-2 ring-zinc-200/90 ring-offset-2 ring-offset-white dark:ring-zinc-700 dark:ring-offset-zinc-900 md:size-32">
                {shop.logo_url && (
                  <AvatarImage src={shop.logo_url} alt={`Logo de ${shop.name}`} className="object-cover" />
                )}
                <AvatarFallback className="bg-slate-100 text-3xl font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-200 md:text-4xl">
                  {shop.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <CardTitle className="text-2xl text-slate-900 dark:text-zinc-100 sm:text-3xl">{shop.name}</CardTitle>
                  <FavoriteButton shopId={shop.id} />
                </div>
                <CardDescription className="mt-1 text-base text-slate-700 dark:text-zinc-300">
                  {shop.category ?? "Comercio local"}
                </CardDescription>
                {shop.description ? (
                  <ShopDescription
                    markdown={shop.description}
                    className="mt-2 text-left text-slate-800 dark:text-zinc-200"
                  />
                ) : null}
              </div>
            </div>

            <ContactButtons
              whatsappUrl={shop.whatsapp_number ? toWhatsAppUrl(shop.whatsapp_number) : null}
              instagramUrl={instagramUrl}
            />
          </CardHeader>
        </Card>

        {flyerUrls.length > 0 && (
          <Card className="overflow-hidden border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Promociones del local</CardTitle>
              <CardDescription>
                Flyers y novedades destacadas de este comercio.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ShopFlyersCarousel flyers={flyerUrls} />
            </CardContent>
          </Card>
        )}

        {(shop.address || hasCoordinates) && (
          <Card className="overflow-hidden border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="size-5 shrink-0 text-emerald-700" />
                <CardTitle className="text-lg">Ubicación</CardTitle>
              </div>
              {shop.address && (
                <CardDescription className="text-base text-slate-700 dark:text-zinc-300">
                  {shop.address}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4 pb-5">
              {embedMapUrl && (
                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <iframe
                    src={embedMapUrl}
                    title={`Mapa de ${shop.name}`}
                    className="h-52 w-full sm:h-64"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              )}
              {googleMapsUrl && (
                <Button
                  render={
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Navigation className="size-4" />
                  Cómo llegar
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {listings.length > 0 ? (
          <StorefrontGridLoadMore
            shopId={shop.id}
            initialListings={listings}
            initialHasMore={hasMoreListings}
          />
        ) : (
          <Card className="border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
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
    <SiteFooter />
    </>
  );
}
