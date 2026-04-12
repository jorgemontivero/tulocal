import Link from "next/link";
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

export type ShopCardShop = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  whatsapp_number: string | null;
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

export function ShopCard({ shop }: { shop: ShopCardShop }) {
  return (
    <Card className="h-full border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            render={<Link href={`/${shop.slug}`} />}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Ver catálogo
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
  );
}
