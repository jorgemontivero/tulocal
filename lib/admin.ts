/** Límites alineados con la landing /precios; `black` es plan interno sin tope. */
export const PLAN_LIMITS: Record<string, number> = {
  bronce: 4,
  plata: 20,
  oro: 80,
  black: Infinity,
};

export const PLAN_LABELS: Record<string, string> = {
  bronce: "Bronce",
  plata: "Plata",
  oro: "Oro",
  black: "Black (interno)",
};

/** Límite por defecto si llega un `plan_type` desconocido (p. ej. datos viejos). */
export const DEFAULT_PLAN_LIMIT = PLAN_LIMITS.bronce;

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  blocked: "Bloqueado",
};

export type AdminSection = "resumen" | "moderacion" | "comercios" | "analytics";

export type AdminShop = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  status: string;
  plan_type: string;
  is_featured: boolean;
  created_at: string;
  listing_count: number;
};

export type PendingShop = {
  id: string;
  name: string;
  category: string | null;
  created_at: string;
};

export type PendingListing = {
  id: string;
  title: string;
  created_at: string;
  shop: { name: string } | null;
};

export type ShopStat = {
  shop_id: string;
  shop_name: string;
  status: string;
  plan_type: string;
  total_views: number;
  total_clicks: number;
  total_impressions: number;
};

export type TopSearch = {
  search_term: string;
  total_searches: number;
  avg_results: number;
};

export type CategoryView = {
  category: string;
  total_events: number;
};

export type AdminKPIs = {
  totalUsers: number;
  totalShops: number;
  approvedShops: number;
  pendingShops: number;
  blockedShops: number;
  activeListings: number;
  topSearches: TopSearch[];
};

export type AdminData = {
  kpis: AdminKPIs;
  pendingShops: PendingShop[];
  pendingListings: PendingListing[];
  allShops: AdminShop[];
  shopStats: ShopStat[];
  topSearches: TopSearch[];
  categoryViews: CategoryView[];
};
