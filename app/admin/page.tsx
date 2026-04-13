import { createClient } from "@/utils/supabase/server";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type {
  AdminData,
  AdminKPIs,
  AdminShop,
  PendingShop,
  PendingListing,
  ShopStat,
  TopSearch,
  CategoryView,
} from "@/lib/admin";

async function fetchAdminData(): Promise<AdminData> {
  const supabase = await createClient();

  const [
    profilesRes,
    shopsRes,
    pendingShopsRes,
    pendingListingsRes,
    activeListingsRes,
    topSearchesRes,
    shopStatsRes,
    categoryViewsRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("shops")
      .select("id,name,slug,category,status,plan_type,is_featured,created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("shops")
      .select("id,name,category,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),

    supabase
      .from("listings")
      .select("id,title,created_at,shops(name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(50),

    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),

    supabase
      .from("search_logs")
      .select("query")
      .order("created_at", { ascending: false })
      .limit(500),

    supabase
      .from("shop_events")
      .select("shop_id,event_type")
      .limit(5000),

    supabase
      .from("shop_events")
      .select("shop_id,event_type,shops(category)")
      .eq("event_type", "page_view")
      .limit(5000),
  ]);

  const shops = (shopsRes.data ?? []) as unknown as Array<{
    id: string;
    name: string;
    slug: string;
    category: string | null;
    status: string;
    plan_type: string;
    is_featured: boolean;
    created_at: string;
  }>;

  const { data: listingCounts } = await supabase
    .from("listings")
    .select("shop_id")
    .in(
      "shop_id",
      shops.map((s) => s.id),
    );

  const countMap = new Map<string, number>();
  for (const row of listingCounts ?? []) {
    countMap.set(row.shop_id, (countMap.get(row.shop_id) ?? 0) + 1);
  }

  const allShops: AdminShop[] = shops.map((s) => ({
    ...s,
    listing_count: countMap.get(s.id) ?? 0,
  }));

  const approvedShops = shops.filter((s) => s.status === "approved").length;
  const pendingShopCount = shops.filter((s) => s.status === "pending").length;
  const blockedShops = shops.filter((s) => s.status === "blocked").length;

  // Aggregate top searches from raw logs
  const searchMap = new Map<string, number>();
  for (const row of topSearchesRes.data ?? []) {
    const term = (row.query as string).toLowerCase().trim();
    if (term) searchMap.set(term, (searchMap.get(term) ?? 0) + 1);
  }
  const topSearches: TopSearch[] = Array.from(searchMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([search_term, total_searches]) => ({
      search_term,
      total_searches,
      avg_results: 0,
    }));

  // Aggregate shop stats from raw events
  const statsAgg = new Map<
    string,
    { views: number; clicks: number; impressions: number }
  >();
  for (const ev of shopStatsRes.data ?? []) {
    const sid = ev.shop_id as string;
    const existing = statsAgg.get(sid) ?? {
      views: 0,
      clicks: 0,
      impressions: 0,
    };
    if (ev.event_type === "page_view") existing.views++;
    else if (ev.event_type === "click") existing.clicks++;
    else if (ev.event_type === "search_impression") existing.impressions++;
    statsAgg.set(sid, existing);
  }

  const shopNameMap = new Map(shops.map((s) => [s.id, s]));
  const shopStats: ShopStat[] = Array.from(statsAgg.entries())
    .map(([shop_id, agg]) => ({
      shop_id,
      shop_name: shopNameMap.get(shop_id)?.name ?? "Desconocido",
      status: shopNameMap.get(shop_id)?.status ?? "",
      plan_type: shopNameMap.get(shop_id)?.plan_type ?? "",
      total_views: agg.views,
      total_clicks: agg.clicks,
      total_impressions: agg.impressions,
    }))
    .sort((a, b) => b.total_views - a.total_views)
    .slice(0, 20);

  // Aggregate category views
  const catMap = new Map<string, number>();
  for (const ev of categoryViewsRes.data ?? []) {
    const cat =
      (ev.shops as unknown as { category: string | null })?.category ??
      "Sin categoría";
    catMap.set(cat, (catMap.get(cat) ?? 0) + 1);
  }
  const categoryViews: CategoryView[] = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, total_events]) => ({ category, total_events }));

  const pendingListings: PendingListing[] = (
    pendingListingsRes.data ?? []
  ).map((l) => ({
    id: l.id,
    title: l.title,
    created_at: l.created_at,
    shop: l.shops as unknown as { name: string } | null,
  }));

  const kpis: AdminKPIs = {
    totalUsers: profilesRes.count ?? 0,
    totalShops: shops.length,
    approvedShops,
    pendingShops: pendingShopCount,
    blockedShops,
    activeListings: activeListingsRes.count ?? 0,
    topSearches: topSearches.slice(0, 3),
  };

  return {
    kpis,
    pendingShops: (pendingShopsRes.data ?? []) as PendingShop[],
    pendingListings,
    allShops,
    shopStats,
    topSearches,
    categoryViews,
  };
}

export default async function AdminPage() {
  const data = await fetchAdminData();
  return <AdminDashboard data={data} />;
}
