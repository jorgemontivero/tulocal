export const SHOP_PLAN_FLYER_LIMITS = {
  plata: 1,
  oro: 3,
  black: 6,
} as const;

export function getShopFlyerLimitByPlan(planType: string | null | undefined): number {
  if (!planType) return 0;
  const key = planType as keyof typeof SHOP_PLAN_FLYER_LIMITS;
  return SHOP_PLAN_FLYER_LIMITS[key] ?? 0;
}

export function canShopPlanUseFlyers(planType: string | null | undefined): boolean {
  return getShopFlyerLimitByPlan(planType) > 0;
}
