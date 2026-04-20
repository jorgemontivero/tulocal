import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CookieBanner } from "@/components/cookie-banner";
import { SiteHeaderWrapper } from "@/components/site-header-wrapper";
import { PromoPopup } from "@/components/promo-popup";
import { ThemeProvider } from "@/components/theme-provider";
import { THEME_KEY } from "@/lib/theme-constants";
import { themeFromCookieValue } from "@/lib/theme-cookie";
import { cn } from "@/lib/utils";
import { PwaRegistry } from "@/components/pwa-registry";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://tulocal.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "tulocal.com.ar — Directorio comercial de Catamarca",
    template: "%s | tulocal.com.ar",
  },
  description:
    "Encontrá comercios, productos y servicios locales en Catamarca. El directorio que potencia el comercio de tu ciudad.",
  keywords: [
    "Catamarca",
    "comercios locales",
    "marketplace",
    "directorio comercial",
    "productos",
    "servicios",
    "Tu Local",
  ],
  authors: [{ name: "Jorge Luis Montivero" }],
  creator: "tulocal.com.ar",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "Ht1onVAS9SK-ODrLIQBPzsUpsk0GlGhtOhtZhOfilrw",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "tulocal.com.ar",
    title: "tulocal.com.ar — Directorio comercial de Catamarca",
    description:
      "Encontrá comercios, productos y servicios locales en Catamarca. El directorio que potencia el comercio de tu ciudad.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "tulocal.com.ar — Directorio comercial de Catamarca",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "tulocal.com.ar — Directorio comercial de Catamarca",
    description:
      "Encontrá comercios, productos y servicios locales en Catamarca.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tu Local",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialTheme = themeFromCookieValue(cookieStore.get(THEME_KEY)?.value);

  return (
    <html
      lang="es-AR"
      suppressHydrationWarning
      className={cn(
        geistSans.variable,
        geistMono.variable,
        "h-full antialiased",
        initialTheme === "dark" && "dark",
      )}
    >
      <body className="flex min-h-full flex-col bg-background">
        <ThemeProvider initialTheme={initialTheme}>
          <SiteHeaderWrapper />
          {children}
          <Analytics />
          <SpeedInsights />
          <CookieBanner />
          <PromoPopup />
          <PwaRegistry />
        </ThemeProvider>
      </body>
    </html>
  );
}
