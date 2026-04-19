"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseListingImageUrls } from "@/lib/listing-display";
import { cn } from "@/lib/utils";

type ListingGalleryProps = {
  imageUrls: unknown;
};

/** Carrusel con scroll snap + flechas + indicadores; parse defensivo de image_urls. */
export function ListingGallery({ imageUrls }: ListingGalleryProps) {
  const imgs = useMemo(() => parseListingImageUrls(imageUrls), [imageUrls]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const urlsKey = imgs.join("|");

  const updateIndexFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || imgs.length <= 1) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    const idx = Math.round(el.scrollLeft / w);
    setActiveIndex(Math.min(Math.max(0, idx), imgs.length - 1));
  }, [imgs.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || imgs.length <= 1) return;
    el.addEventListener("scroll", updateIndexFromScroll, { passive: true });
    return () => el.removeEventListener("scroll", updateIndexFromScroll);
  }, [imgs.length, updateIndexFromScroll]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
    queueMicrotask(() => {
      setActiveIndex(0);
    });
  }, [urlsKey]);

  const goTo = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el || imgs.length === 0) return;
      const clamped = Math.min(Math.max(0, index), imgs.length - 1);
      const w = el.clientWidth;
      el.scrollTo({ left: clamped * w, behavior: "smooth" });
      setActiveIndex(clamped);
    },
    [imgs.length],
  );

  if (imgs.length === 0) {
    return (
      <div className="flex h-44 w-full items-center justify-center bg-zinc-200 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        Sin imagen
      </div>
    );
  }

  if (imgs.length === 1) {
    return (
      <div className="relative h-44 w-full">
        <Image
          src={imgs[0]}
          alt="Foto del producto"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    );
  }

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < imgs.length - 1;

  return (
    <div className="relative h-44 w-full">
      <div
        ref={scrollRef}
        role="region"
        aria-label="Imagenes del producto"
        aria-roledescription="carrusel"
        className={cn(
          "flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {imgs.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative h-44 min-w-full shrink-0 snap-center snap-always"
          >
            <Image
              src={src}
              alt={`Foto ${i + 1} de ${imgs.length}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Imagen anterior"
        disabled={!canPrev}
        onClick={() => goTo(activeIndex - 1)}
        className={cn(
          "absolute top-1/2 left-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/85 text-zinc-800 shadow-sm backdrop-blur-sm transition-opacity dark:border-zinc-600 dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:bg-zinc-800",
          !canPrev && "pointer-events-none opacity-40",
          canPrev && "hover:bg-white dark:hover:bg-zinc-800",
        )}
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Imagen siguiente"
        disabled={!canNext}
        onClick={() => goTo(activeIndex + 1)}
        className={cn(
          "absolute top-1/2 right-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/85 text-zinc-800 shadow-sm backdrop-blur-sm transition-opacity dark:border-zinc-600 dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:bg-zinc-800",
          !canNext && "pointer-events-none opacity-40",
          canNext && "hover:bg-white dark:hover:bg-zinc-800",
        )}
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>

      <div
        className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5"
        role="tablist"
        aria-label="Seleccionar foto"
      >
        {imgs.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Foto ${i + 1} de ${imgs.length}`}
            onClick={() => goTo(i)}
            className={cn(
              "size-2.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-zinc-900",
              i === activeIndex
                ? "scale-110 bg-white shadow-sm ring-1 ring-zinc-500/50 dark:bg-emerald-400 dark:ring-emerald-300/60"
                : "bg-white/55 hover:bg-white/85 dark:bg-zinc-600 dark:hover:bg-zinc-500",
            )}
          />
        ))}
      </div>
    </div>
  );
}
