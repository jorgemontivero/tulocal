"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Shield,
  Store,
  ShoppingBag,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminData, AdminSection } from "@/lib/admin";
import { KpiCards } from "@/components/admin/kpi-cards";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { ShopsTable } from "@/components/admin/shops-table";
import { ListingsManager } from "@/components/admin/listings-manager";
import { AnalyticsSection } from "@/components/admin/analytics-section";

const NAV_ITEMS: { key: AdminSection; label: string; icon: React.ElementType }[] = [
  { key: "resumen", label: "Resumen", icon: LayoutDashboard },
  { key: "moderacion", label: "Moderación", icon: Shield },
  { key: "comercios", label: "Comercios", icon: Store },
  { key: "productos", label: "Productos", icon: ShoppingBag },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminDashboard({ data }: { data: AdminData }) {
  const [section, setSection] = useState<AdminSection>("resumen");
  const [mobileOpen, setMobileOpen] = useState(false);

  const pendingTotal =
    data.pendingShops.length + data.pendingListings.length;

  function navigate(s: AdminSection) {
    setSection(s);
    setMobileOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-zinc-200 bg-white lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b border-zinc-100 px-5 py-4">
            <h1 className="text-lg font-bold text-zinc-900">Admin Panel</h1>
            <p className="text-xs text-zinc-500">tulocal.com.ar</p>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = section === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                  {item.key === "moderacion" && pendingTotal > 0 && (
                    <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">
                      {pendingTotal}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="border-t border-zinc-100 px-3 py-3">
            <Button
              render={<a href="/dashboard" />}
              variant="ghost"
              className="w-full justify-start gap-2 text-sm text-zinc-500"
            >
              <LogOut className="size-4" />
              Volver al sitio
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header + drawer */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 lg:hidden">
          <h1 className="text-base font-bold text-zinc-900">Admin Panel</h1>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>

        {mobileOpen && (
          <div className="border-b border-zinc-200 bg-white px-4 pb-3 lg:hidden">
            <nav className="flex flex-wrap gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigate(item.key)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      section === item.key
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-zinc-600 hover:bg-zinc-50",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                    {item.key === "moderacion" && pendingTotal > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">
                        {pendingTotal}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {section === "resumen" && (
            <div className="space-y-8">
              <KpiCards kpis={data.kpis} />
              <ModerationQueue
                pendingShops={data.pendingShops}
                pendingListings={data.pendingListings}
                preview
              />
            </div>
          )}
          {section === "moderacion" && (
            <ModerationQueue
              pendingShops={data.pendingShops}
              pendingListings={data.pendingListings}
            />
          )}
          {section === "comercios" && <ShopsTable shops={data.allShops} />}
          {section === "productos" && (
            <ListingsManager listings={data.managedListings} />
          )}
          {section === "analytics" && (
            <AnalyticsSection
              shopStats={data.shopStats}
              topSearches={data.topSearches}
              categoryViews={data.categoryViews}
            />
          )}
        </main>
      </div>
    </div>
  );
}
