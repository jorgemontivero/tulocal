"use client";

import {
  TrendingUp,
  Eye,
  MousePointerClick,
  Search,
  FolderOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_LABELS, type ShopStat, type TopSearch, type CategoryView } from "@/lib/admin";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <TrendingUp className="size-8 text-zinc-200" />
      <p className="text-sm text-zinc-400">{message}</p>
    </div>
  );
}

function TopShopsTable({ stats }: { stats: ShopStat[] }) {
  if (stats.length === 0)
    return <EmptyState message="Aún no hay datos de visitas" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <th className="pb-2 pr-4">#</th>
            <th className="pb-2 pr-4">Comercio</th>
            <th className="pb-2 pr-4 text-right">
              <span className="inline-flex items-center gap-1">
                <Eye className="size-3" /> Vistas
              </span>
            </th>
            <th className="pb-2 pr-4 text-right">
              <span className="inline-flex items-center gap-1">
                <MousePointerClick className="size-3" /> Clics
              </span>
            </th>
            <th className="hidden pb-2 text-right sm:table-cell">Plan</th>
          </tr>
        </thead>
        <tbody>
          {stats.slice(0, 10).map((s, i) => (
            <tr
              key={s.shop_id}
              className="border-b border-zinc-50 last:border-0"
            >
              <td className="py-2 pr-4 text-zinc-400">{i + 1}</td>
              <td className="py-2 pr-4 font-medium text-zinc-900">
                {s.shop_name}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums text-zinc-700">
                {s.total_views.toLocaleString("es-AR")}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums text-zinc-700">
                {s.total_clicks.toLocaleString("es-AR")}
              </td>
              <td className="hidden py-2 text-right sm:table-cell">
                <Badge className="bg-zinc-100 text-xs text-zinc-600">
                  {PLAN_LABELS[s.plan_type] ?? s.plan_type}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TopSearchesTable({ searches }: { searches: TopSearch[] }) {
  if (searches.length === 0)
    return <EmptyState message="Aún no hay datos de búsquedas" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <th className="pb-2 pr-4">#</th>
            <th className="pb-2 pr-4">Término</th>
            <th className="pb-2 text-right">Búsquedas</th>
          </tr>
        </thead>
        <tbody>
          {searches.slice(0, 15).map((s, i) => (
            <tr
              key={s.search_term}
              className="border-b border-zinc-50 last:border-0"
            >
              <td className="py-2 pr-4 text-zinc-400">{i + 1}</td>
              <td className="py-2 pr-4 font-medium text-zinc-900">
                &ldquo;{s.search_term}&rdquo;
              </td>
              <td className="py-2 text-right tabular-nums text-zinc-700">
                {s.total_searches.toLocaleString("es-AR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoryViewsTable({ views }: { views: CategoryView[] }) {
  if (views.length === 0)
    return <EmptyState message="Aún no hay datos de categorías" />;

  const max = views[0]?.total_events ?? 1;

  return (
    <div className="space-y-3">
      {views.slice(0, 10).map((cv) => (
        <div key={cv.category} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-900">
              {cv.category}
            </span>
            <span className="tabular-nums text-zinc-500">
              {cv.total_events.toLocaleString("es-AR")} vistas
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(cv.total_events / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

type AnalyticsSectionProps = {
  shopStats: ShopStat[];
  topSearches: TopSearch[];
  categoryViews: CategoryView[];
};

export function AnalyticsSection({
  shopStats,
  topSearches,
  categoryViews,
}: AnalyticsSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900">
        Analytics del marketplace
      </h2>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="size-4 text-blue-600" />
              Comercios más visitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopShopsTable stats={shopStats} />
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="size-4 text-purple-600" />
              Búsquedas más frecuentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopSearchesTable searches={topSearches} />
          </CardContent>
        </Card>
      </div>

      <Card className="border border-zinc-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderOpen className="size-4 text-emerald-600" />
            Visitas por categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryViewsTable views={categoryViews} />
        </CardContent>
      </Card>
    </div>
  );
}
