"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import { LayoutDashboard, Menu, Moon, Search, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const brandSans = Poppins({
  subsets: ["latin"],
  weight: ["800"],
  style: ["italic"],
  display: "swap",
});

export type SiteHeaderProps = {
  isLoggedIn: boolean;
};

function SearchBarFallback() {
  return (
    <div
      className="h-10 w-full max-w-lg rounded-lg bg-white/15 ring-1 ring-white/20"
      aria-hidden
    />
  );
}

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/mapa", label: "Mapa" },
  { href: "/precios", label: "Precios" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
] as const;

export function SiteHeader({ isLoggedIn }: SiteHeaderProps) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const showNavSearch = pathname !== "/";
  const { theme, toggleTheme } = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    const resetUiState = window.setTimeout(() => {
      closeDrawer();
      setSearchOpen(false);
    }, 0);

    return () => {
      window.clearTimeout(resetUiState);
    };
  }, [pathname, closeDrawer]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  if (isLogin) {
    return null;
  }

  const isDarkMode = theme === "dark";
  const ThemeIcon = isDarkMode ? Sun : Moon;
  const themeButtonLabel = isDarkMode
    ? "Activar modo claro"
    : "Activar modo oscuro";

  return (
    <>
      <header className="border-b border-emerald-950/30 bg-emerald-800 text-white shadow-sm dark:border-emerald-200/10 dark:bg-emerald-950">
        <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex flex-row flex-nowrap items-center justify-between gap-2">
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Image
                src="/logo-tulocal.png"
                alt="tulocal.com.ar — Directorio comercial de Catamarca"
                width={220}
                height={56}
                className="h-9 w-auto object-contain drop-shadow sm:h-14"
                priority
              />
              <span
                className={`${brandSans.className} hidden text-2xl font-extrabold italic tracking-tight text-white sm:block`}
              >
                Tu Local
              </span>
            </Link>

            {/* Search bar — desktop siempre visible; mobile togglable */}
            {showNavSearch && (
              <div
                className={cn(
                  "mx-1 flex min-w-0 flex-1 justify-center sm:mx-2",
                  searchOpen ? "flex" : "hidden sm:flex",
                )}
              >
                <div className="w-full min-w-[120px] max-w-lg">
                  <Suspense fallback={<SearchBarFallback />}>
                    <SearchBar variant="compact" className="w-full" />
                  </Suspense>
                </div>
              </div>
            )}

            {/* Spacer cuando no hay search */}
            {!showNavSearch && <div className="min-w-0 flex-1" aria-hidden />}

            {/* Desktop nav links */}
            <div className="hidden shrink-0 items-center gap-3 lg:flex">
              {NAV_LINKS.filter((l) => l.href !== "/").map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap text-sm font-medium underline-offset-4 transition-colors hover:text-white hover:underline",
                    pathname === link.href ? "text-white" : "text-white/90",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex size-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label={themeButtonLabel}
                title={themeButtonLabel}
              >
                <ThemeIcon className="size-5" />
              </button>
              {isLoggedIn ? (
                <Button
                  render={<Link href="/dashboard" />}
                  className="border border-white/20 bg-white px-4 text-emerald-800 shadow-sm hover:bg-emerald-50 dark:border-emerald-300/30 dark:bg-emerald-200 dark:text-emerald-950 dark:hover:bg-emerald-100"
                >
                  <LayoutDashboard className="text-emerald-800 dark:text-emerald-950" />
                  Mi Panel
                </Button>
              ) : (
                <Button
                  render={<Link href="/login" />}
                  className="border border-white/20 bg-white px-4 text-emerald-800 shadow-sm hover:bg-emerald-50 dark:border-emerald-300/30 dark:bg-emerald-200 dark:text-emerald-950 dark:hover:bg-emerald-100"
                >
                  Acceso Vendedores
                </Button>
              )}
            </div>

            {/* Mobile action buttons */}
            <div className="flex shrink-0 items-center gap-1 lg:hidden">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex size-10 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={themeButtonLabel}
                title={themeButtonLabel}
              >
                <ThemeIcon className="size-5" />
              </button>
              {showNavSearch && !searchOpen && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex size-10 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/10 hover:text-white sm:hidden"
                  aria-label="Abrir buscador"
                >
                  <Search className="size-5" />
                </button>
              )}
              {searchOpen && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="flex size-10 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/10 hover:text-white sm:hidden"
                  aria-label="Cerrar buscador"
                >
                  <X className="size-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex size-10 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Abrir menú"
              >
                <Menu className="size-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay + panel */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden
          />

          {/* Panel */}
          <nav
            className="absolute top-0 right-0 flex h-full w-72 max-w-[85vw] flex-col bg-emerald-800 shadow-2xl animate-in slide-in-from-right duration-200 dark:bg-emerald-950"
            aria-label="Menú principal"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className={`${brandSans.className} text-xl font-extrabold italic text-white`}>
                Tu Local
              </span>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex size-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Cerrar menú"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeDrawer}
                  className={cn(
                    "rounded-xl px-4 py-3 text-base font-medium transition-colors",
                    pathname === link.href
                      ? "bg-white/15 text-white"
                      : "text-white/90 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-white/10 px-4 py-5">
              <button
                type="button"
                onClick={toggleTheme}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                aria-label={themeButtonLabel}
              >
                <ThemeIcon className="size-4" />
                {isDarkMode ? "Usar modo claro" : "Usar modo oscuro"}
              </button>
              {isLoggedIn ? (
                <Button
                  render={<Link href="/dashboard" onClick={closeDrawer} />}
                  className="w-full justify-center border border-white/20 bg-white text-emerald-800 shadow-sm hover:bg-emerald-50 dark:border-emerald-300/30 dark:bg-emerald-200 dark:text-emerald-950 dark:hover:bg-emerald-100"
                >
                  <LayoutDashboard className="text-emerald-800 dark:text-emerald-950" />
                  Mi Panel
                </Button>
              ) : (
                <Button
                  render={<Link href="/login" onClick={closeDrawer} />}
                  className="w-full justify-center border border-white/20 bg-white text-emerald-800 shadow-sm hover:bg-emerald-50 dark:border-emerald-300/30 dark:bg-emerald-200 dark:text-emerald-950 dark:hover:bg-emerald-100"
                >
                  Acceso Vendedores
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
