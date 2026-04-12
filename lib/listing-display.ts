/** Precio nulo o 0 → mostrar "Consultar precio" en vitrina. */
export function listingShowsConsultar(price: number | null | undefined): boolean {
  return price == null || price === 0;
}

/** Precio tachado: precio original antes del descuento, dado el precio final y el % off. */
export function listingOriginalBeforeDiscount(
  finalPrice: number,
  discountPct: number,
): number {
  if (!discountPct || discountPct <= 0 || discountPct >= 100) return finalPrice;
  return finalPrice / (1 - discountPct / 100);
}

export function parseListingImageUrls(raw: unknown): string[] {
  if (raw == null) return [];

  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return [];
    if (t.startsWith("[")) {
      try {
        const parsed = JSON.parse(t) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.filter((x): x is string => typeof x === "string" && x.length > 0);
        }
      } catch {
        return [];
      }
    }
    return [];
  }

  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string" && x.length > 0);
  }

  return [];
}
