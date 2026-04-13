"use client";

import {
  Users,
  Store,
  ShoppingBag,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminKPIs } from "@/lib/admin";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: string;
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "text-zinc-600",
}: StatCardProps) {
  return (
    <Card className="border border-zinc-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-zinc-500">
          {title}
        </CardTitle>
        <Icon className={`size-4 shrink-0 ${color}`} />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold text-zinc-900">{value}</div>
        {subtitle && (
          <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function KpiCards({ kpis }: { kpis: AdminKPIs }) {
  const shopBreakdown = [
    kpis.approvedShops > 0 && `${kpis.approvedShops} activos`,
    kpis.pendingShops > 0 && `${kpis.pendingShops} pendientes`,
    kpis.blockedShops > 0 && `${kpis.blockedShops} bloqueados`,
  ]
    .filter(Boolean)
    .join(" · ");

  const topSearch =
    kpis.topSearches.length > 0
      ? kpis.topSearches
          .slice(0, 3)
          .map((s) => `"${s.search_term}"`)
          .join(", ")
      : "Sin datos aún";

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">
        Resumen general
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Usuarios registrados"
          value={kpis.totalUsers}
          icon={Users}
          color="text-blue-600"
        />
        <StatCard
          title="Comercios"
          value={kpis.totalShops}
          subtitle={shopBreakdown}
          icon={Store}
          color="text-emerald-600"
        />
        <StatCard
          title="Publicaciones activas"
          value={kpis.activeListings}
          icon={ShoppingBag}
          color="text-amber-600"
        />
        <StatCard
          title="Búsquedas top"
          value={
            kpis.topSearches.length > 0
              ? kpis.topSearches[0].search_term
              : "—"
          }
          subtitle={topSearch}
          icon={Search}
          color="text-purple-600"
        />
      </div>

      {(kpis.pendingShops > 0 || kpis.blockedShops > 0) && (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <Clock className="size-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {kpis.pendingShops} pendientes
              </p>
              <p className="text-xs text-amber-700">Comercios por moderar</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                {kpis.approvedShops} activos
              </p>
              <p className="text-xs text-emerald-700">Comercios aprobados</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <XCircle className="size-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-900">
                {kpis.blockedShops} bloqueados
              </p>
              <p className="text-xs text-red-700">Comercios bloqueados</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
