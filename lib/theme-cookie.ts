import { THEME_KEY } from "@/lib/theme-constants";

export type ThemeValue = "light" | "dark";

/** Max-Age en segundos (~1 año) para la cookie del tema. */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function themeFromCookieValue(value: string | undefined): ThemeValue {
  return value === "dark" ? "dark" : "light";
}

export function themeCookiePair(theme: ThemeValue): string {
  return `${THEME_KEY}=${theme}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
}
