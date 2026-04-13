"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Search,
  Star,
  StarOff,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  PLAN_LABELS,
  PLAN_LIMITS,
  STATUS_LABELS,
  type AdminShop,
} from "@/lib/admin";
import {
  updateShopPlan,
  updateShopFeatured,
  updateShopStatus,
} from "@/app/admin/actions";

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  blocked: "bg-red-100 text-red-800",
};

const PLAN_COLORS: Record<string, string> = {
  bronce: "bg-orange-100 text-orange-800",
  plata: "bg-slate-200 text-slate-800",
  oro: "bg-yellow-100 text-yellow-800",
};

function ShopRow({ shop: initial }: { shop: AdminShop }) {
  const [shop, setShop] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const planLimit = PLAN_LIMITS[shop.plan_type] ?? 5;
  const overLimit = shop.listing_count > planLimit;

  function handlePlanChange(plan: string | null) {
    if (!plan || plan === shop.plan_type) return;
    setError(null);
    startTransition(async () => {
      const res = await updateShopPlan(shop.id, plan);
      if (res.ok) setShop((s) => ({ ...s, plan_type: plan }));
      else setError(res.error ?? "Error");
    });
  }

  function handleStatusChange(status: string | null) {
    if (!status || status === shop.status) return;
    setError(null);
    startTransition(async () => {
      const res = await updateShopStatus(shop.id, status);
      if (res.ok) setShop((s) => ({ ...s, status }));
      else setError(res.error ?? "Error");
    });
  }

  function toggleFeatured() {
    setError(null);
    startTransition(async () => {
      const res = await updateShopFeatured(shop.id, !shop.is_featured);
      if (res.ok)
        setShop((s) => ({ ...s, is_featured: !s.is_featured }));
      else setError(res.error ?? "Error");
    });
  }

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-colors sm:grid-cols-[2fr_1fr_1fr_1fr_auto_auto]",
        overLimit ? "border-red-200" : "border-zinc-200",
      )}
    >
      {/* Name + category */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-zinc-900">
            {shop.name}
          </p>
          <Button
            render={
              <a
                href={`/${shop.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            variant="ghost"
            className="hidden size-6 p-0 text-zinc-400 hover:text-zinc-700 sm:inline-flex"
          >
            <ExternalLink className="size-3" />
          </Button>
        </div>
        <p className="truncate text-xs text-zinc-500">
          {shop.category ?? "Sin categoría"} · {shop.listing_count} productos
        </p>
        {overLimit && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="size-3" />
            Excede el límite del plan ({planLimit})
          </p>
        )}
        {error && (
          <p className="mt-0.5 text-xs text-red-600">{error}</p>
        )}
      </div>

      {/* Plan select */}
      <div className="hidden sm:block">
        <Select
          value={shop.plan_type}
          onValueChange={handlePlanChange}
          disabled={pending}
        >
          <SelectTrigger className={cn("h-7 w-full text-xs", PLAN_COLORS[shop.plan_type])}>
            <SelectValue>
              {PLAN_LABELS[shop.plan_type] ?? shop.plan_type}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bronce">Bronce</SelectItem>
            <SelectItem value="plata">Plata</SelectItem>
            <SelectItem value="oro">Oro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status select */}
      <div className="hidden sm:block">
        <Select
          value={shop.status}
          onValueChange={handleStatusChange}
          disabled={pending}
        >
          <SelectTrigger className={cn("h-7 w-full text-xs", STATUS_COLORS[shop.status])}>
            <SelectValue>
              {STATUS_LABELS[shop.status] ?? shop.status}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="approved">Aprobado</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="blocked">Bloqueado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Featured toggle */}
      <div className="hidden sm:block">
        <button
          type="button"
          disabled={pending}
          onClick={toggleFeatured}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
            shop.is_featured
              ? "border-yellow-300 bg-yellow-50 text-yellow-800"
              : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100",
          )}
        >
          {pending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : shop.is_featured ? (
            <Star className="size-3 fill-yellow-500 text-yellow-500" />
          ) : (
            <StarOff className="size-3" />
          )}
          {shop.is_featured ? "Sí" : "No"}
        </button>
      </div>

      {/* Listing count */}
      <div className="hidden text-right sm:block">
        <Badge
          className={cn(
            "text-xs",
            overLimit
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-zinc-200 bg-zinc-50 text-zinc-600",
          )}
        >
          {shop.listing_count}/{planLimit === Infinity ? "∞" : planLimit}
        </Badge>
      </div>

      {/* Mobile actions */}
      <div className="flex flex-wrap items-center gap-1.5 sm:hidden">
        <Badge className={cn("text-xs", STATUS_COLORS[shop.status])}>
          {STATUS_LABELS[shop.status] ?? shop.status}
        </Badge>
        <Badge className={cn("text-xs", PLAN_COLORS[shop.plan_type])}>
          {PLAN_LABELS[shop.plan_type] ?? shop.plan_type}
        </Badge>
        {shop.is_featured && (
          <Star className="size-3 fill-yellow-500 text-yellow-500" />
        )}
      </div>
    </div>
  );
}

export function ShopsTable({ shops: initial }: { shops: AdminShop[] }) {
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = useMemo(() => {
    return initial.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (filterPlan !== "all" && s.plan_type !== filterPlan) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      return true;
    });
  }, [initial, search, filterPlan, filterStatus]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900">
        Gestión de comercios
      </h2>

      {/* Filters */}
      <Card className="border border-zinc-200 bg-white shadow-sm">
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) =>
                setSearch((e.target as HTMLInputElement).value)
              }
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterPlan} onValueChange={(v) => setFilterPlan(v ?? "all")}>
              <SelectTrigger className="w-28">
                <SelectValue>
                  {filterPlan === "all"
                    ? "Plan"
                    : PLAN_LABELS[filterPlan] ?? filterPlan}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="bronce">Bronce</SelectItem>
                <SelectItem value="plata">Plata</SelectItem>
                <SelectItem value="oro">Oro</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v ?? "all")}
            >
              <SelectTrigger className="w-28">
                <SelectValue>
                  {filterStatus === "all"
                    ? "Estado"
                    : STATUS_LABELS[filterStatus] ?? filterStatus}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="approved">Aprobado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table header (desktop) */}
      <div className="hidden rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto_auto] sm:gap-3">
        <span>Comercio</span>
        <span>Plan</span>
        <span>Estado</span>
        <span>Destacado</span>
        <span className="text-right">Productos</span>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="border-dashed border-zinc-300">
            <CardContent className="py-10 text-center">
              <p className="text-sm text-zinc-500">
                No se encontraron comercios con estos filtros
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((shop) => <ShopRow key={shop.id} shop={shop} />)
        )}
      </div>

      <p className="text-xs text-zinc-400">
        Mostrando {filtered.length} de {initial.length} comercios
      </p>
    </div>
  );
}
