import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CookieBanner } from "@/components/cookie-banner";
import { SiteHeaderWrapper } from "@/components/site-header-wrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "tulocal.com.ar | Directorio comercial de Catamarca",
  description:
    "Encuentra comercios, productos y servicios locales en Catamarca. Potenciando el comercio local.",
  icons: {
    icon: "/logo-tulocal.png",
    shortcut: "/logo-tulocal.png",
    apple: "/logo-tulocal.png",
  },
  verification: {
    google: "Ht1onVAS9SK-ODrLIQBPzsUpsk0GlGhtOhtZhOfilrw",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-100">
        <SiteHeaderWrapper />
        {children}
        <Analytics />
        <SpeedInsights />
        <CookieBanner />
      </body>
    </html>
  );
}
