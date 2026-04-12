import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/nosotros", "/contacto", "/terminos", "/privacidad"],
        disallow: ["/dashboard/", "/api/", "/_next/"],
      },
    ],
    sitemap: "https://tulocal.com.ar/sitemap.xml",
  };
}
