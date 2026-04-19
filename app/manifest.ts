import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "tulocal.com.ar — Directorio de Catamarca",
    short_name: "Tu Local",
    description: "Encontrá comercios, productos y servicios locales en Catamarca.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#059669",
    icons: [
      {
        src: "/logo-tulocal.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo-tulocal.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logo-tulocal.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
