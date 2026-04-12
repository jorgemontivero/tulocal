"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";

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

export function SiteHeader({ isLoggedIn }: SiteHeaderProps) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const showNavSearch = pathname !== "/";

  if (isLogin) {
    return null;
  }

  return (
    <header className="border-b border-emerald-950/30 bg-emerald-800 text-white shadow-sm">
      <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex flex-row flex-nowrap items-center justify-between gap-2">
          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Image
              src="/logo-tulocal.png"
              alt=""
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

          {showNavSearch ? (
            <div className="mx-1 flex min-w-0 flex-1 justify-center sm:mx-2">
              <div className="w-full min-w-[120px] max-w-lg">
                <Suspense fallback={<SearchBarFallback />}>
                  <SearchBar variant="compact" className="w-full" />
                </Suspense>
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1" aria-hidden />
          )}

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/nosotros"
              className="whitespace-nowrap text-sm font-medium text-white/90 underline-offset-4 hover:text-white hover:underline"
            >
              Nosotros
            </Link>
            <Link
              href="/contacto"
              className="whitespace-nowrap text-sm font-medium text-white/90 underline-offset-4 hover:text-white hover:underline"
            >
              Contacto
            </Link>
            {isLoggedIn ? (
              <Button
                render={<Link href="/dashboard" />}
                className="border border-white/20 bg-white px-2 text-emerald-800 shadow-sm hover:bg-emerald-50 sm:px-4"
              >
                <LayoutDashboard className="text-emerald-800" />
                Mi Panel
              </Button>
            ) : (
              <Button
                render={<Link href="/login" />}
                className="border border-white/20 bg-white px-2 text-emerald-800 shadow-sm hover:bg-emerald-50 sm:px-4"
              >
                Acceso Vendedores
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
