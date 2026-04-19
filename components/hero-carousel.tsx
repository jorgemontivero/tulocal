"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SLIDE_MS = 5000;

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop",
    alt: "Paisaje y sierras de la región",
  },
  {
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format&fit=crop",
    alt: "Gastronomía regional y platos típicos",
  },
  {
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80&auto=format&fit=crop",
    alt: "Comercio local y vidrieras de negocios",
  },
  {
    src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80&auto=format&fit=crop",
    alt: "Herramientas y servicios para el hogar",
  },
  {
    src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80&auto=format&fit=crop",
    alt: "Café y encuentros en espacios de barrio",
  },
] as const;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const id = window.setInterval(goNext, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [goNext]);

  return (
    <div
      className="relative h-[400px] w-full overflow-hidden rounded-3xl bg-zinc-200 shadow-xl ring-1 ring-zinc-900/5"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Imágenes del comercio local en Catamarca"
    >
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-700 ease-in-out motion-reduce:transition-none",
            i === index ? "z-[1] opacity-100" : "z-0 opacity-0",
          )}
        />
      ))}
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-zinc-900/25 via-transparent to-transparent"
        aria-hidden
      />
      <div className="absolute bottom-4 left-0 right-0 z-[3] flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir a la imagen ${i + 1} de ${SLIDES.length}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              "pointer-events-auto h-2.5 rounded-full transition-all duration-300",
              i === index
                ? "w-8 bg-white shadow-sm"
                : "w-2.5 bg-white/50 hover:bg-white/80",
            )}
          />
        ))}
      </div>
    </div>
  );
}
