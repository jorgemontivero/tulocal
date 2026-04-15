import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CookieBanner } from "@/components/cookie-banner";
import { SiteHeaderWrapper } from "@/components/site-header-wrapper";
import { PromoPopup } from "@/components/promo-popup";
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
    icon: "/logo-tulocal.png",
    shortcut: "/logo-tulocal.png",
    apple: "/logo-tulocal.png",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-AR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background">
        <SiteHeaderWrapper />
        {children}
        <Analytics />
        <SpeedInsights />
        <CookieBanner />
        <PromoPopup />
      </body>
    </html>
  );
}
