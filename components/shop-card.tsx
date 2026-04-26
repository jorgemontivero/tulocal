import Link from "next/link";
import Image from "next/image";
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
import { cn } from "@/lib/utils";
import { markdownToPlainText } from "@/lib/shop-description";
export type ShopCardShop = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  whatsapp_number: string | null;
  plan_type: string | null;
};

function shortDescription(description: string | null): string {
  const plain = markdownToPlainText(description ?? "");
  if (!plain) return "Comercio local de Catamarca.";
  return plain.length > 110 ? `${plain.slice(0, 110)}...` : plain;
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

export type ShopCardProps = {
  shop: ShopCardShop;
  /** Directorio home: logo grande arriba y foco en nombre + enlace al perfil. */
  variant?: "default" | "directory";
};

function isPremiumPlan(planType: string | null | undefined): boolean {
  return planType === "plata" || planType === "oro" || planType === "black";
}

function planBadge(planType: string | null | undefined): {
  label: string;
  className: string;
} | null {
  if (!planType) return null;
  if (planType === "plata") {
    return {
      label: "Plan Plata",
      className:
        "border border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
    };
  }
  if (planType === "oro" || planType === "black") {
    return {
      label: "Plan Oro",
      className:
        "border border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-500/70 dark:bg-amber-950/80 dark:text-amber-100",
    };
  }
  return null;
}

export function ShopCard({ shop, variant = "default" }: ShopCardProps) {
  const premium = isPremiumPlan(shop.plan_type);
  const premiumBadge = planBadge(shop.plan_type);

  if (variant === "directory") {
    return (
      <Card
        className={cn(
          "h-full overflow-hidden border shadow-sm transition-shadow hover:shadow-md",
          premium
            ? "border-amber-300 bg-gradient-to-b from-amber-50 to-white ring-1 ring-amber-200/70 dark:border-amber-500/55 dark:bg-gradient-to-b dark:from-amber-950/90 dark:to-zinc-900 dark:ring-amber-400/30 dark:shadow-[0_12px_40px_-12px_rgba(251,191,36,0.18)]"
            : "border-zinc-200 bg-white dark:border-zinc-600 dark:bg-zinc-900 dark:shadow-lg dark:shadow-black/25",
        )}
      >
        <Link
          href={`/${shop.slug}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900"
        >
          <div
            className={`relative flex h-36 w-full items-center justify-center px-4 pt-5 pb-2 ${
              premium
                ? "bg-gradient-to-b from-amber-100/70 to-amber-50/40 dark:from-amber-900/50 dark:to-zinc-900/90"
                : "bg-gradient-to-b from-slate-50 to-white dark:from-zinc-800 dark:to-zinc-900"
            }`}
          >
            {shop.logo_url ? (
              <Image
                src={shop.logo_url}
                alt={`Logo de ${shop.name}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain p-4"
              />
            ) : (
              <span
                className="flex size-24 items-center justify-center rounded-2xl bg-slate-200/90 text-3xl font-bold text-slate-600 dark:bg-zinc-700 dark:text-zinc-200"
                aria-hidden
              >
                {shop.name.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <CardHeader className="space-y-1 pb-2 pt-3">
            <CardTitle className="line-clamp-2 text-center text-lg leading-snug text-zinc-900 dark:text-zinc-100">
              {shop.name}
            </CardTitle>
            <CardDescription className="line-clamp-2 min-h-[2.5rem] text-center text-sm text-zinc-600 dark:text-zinc-400">
              {shortDescription(shop.description)}
            </CardDescription>
            {premiumBadge && (
              <div className="pt-1 text-center">
                <Badge className={premiumBadge.className}>{premiumBadge.label}</Badge>
              </div>
            )}
          </CardHeader>
        </Link>
        <CardContent className="space-y-3 pb-5">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge className="bg-emerald-600 text-white">{rubroFromSlug(shop.slug)}</Badge>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              render={<Link href={`/${shop.slug}`} />}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Ver local
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
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
              >
                <MessageCircle />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "h-full border shadow-sm transition-shadow hover:shadow-md",
        premium
          ? "border-amber-300 bg-gradient-to-b from-amber-50 to-white ring-1 ring-amber-200/70 dark:border-amber-500/55 dark:bg-gradient-to-b dark:from-amber-950/90 dark:to-zinc-900 dark:ring-amber-400/30 dark:shadow-[0_12px_40px_-12px_rgba(251,191,36,0.18)]"
          : "border-zinc-200 bg-white dark:border-zinc-600 dark:bg-zinc-900 dark:shadow-lg dark:shadow-black/25",
      )}
    >
      <CardHeader>
        <div className="mb-2 flex items-center gap-3">
          <Avatar className="size-10">
            {shop.logo_url && (
              <AvatarImage src={shop.logo_url} alt={`Logo de ${shop.name}`} />
            )}
            <AvatarFallback className="bg-slate-100 font-semibold text-slate-700 dark:bg-zinc-700 dark:text-zinc-200">
              {shop.name.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="line-clamp-1 text-zinc-900 dark:text-zinc-100">{shop.name}</CardTitle>
        </div>
        <CardDescription className="line-clamp-2 min-h-[2.5rem] text-zinc-600 dark:text-zinc-400">
          {shortDescription(shop.description)}
        </CardDescription>
        {premiumBadge && (
          <div className="pt-1">
            <Badge className={premiumBadge.className}>{premiumBadge.label}</Badge>
          </div>
        )}
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
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              <MessageCircle />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
