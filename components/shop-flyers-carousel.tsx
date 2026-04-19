"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SLIDE_MS = 5000;
const GAP_PX = 8;

function useVisibleSlides(): 1 | 2 | 3 {
  const [v, setV] = useState<1 | 2 | 3>(1);
  useEffect(() => {
    const md = window.matchMedia("(min-width: 768px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      if (lg.matches) setV(3);
      else if (md.matches) setV(2);
      else setV(1);
    };
    sync();
    md.addEventListener("change", sync);
    lg.addEventListener("change", sync);
    return () => {
      md.removeEventListener("change", sync);
      lg.removeEventListener("change", sync);
    };
  }, []);
  return v;
}

export function ShopFlyersCarousel({ flyers }: { flyers: string[] }) {
  const visible = useVisibleSlides();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportW, setViewportW] = useState(0);
  const [index, setIndex] = useState(0);

  const effectiveVisible = Math.max(1, Math.min(visible, flyers.length));

  const slideW =
    viewportW > 0
      ? (viewportW - GAP_PX * (effectiveVisible - 1)) / effectiveVisible
      : 0;

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setViewportW(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [visible, flyers.length]);

  const maxIndex = Math.max(0, flyers.length - effectiveVisible);
  const pageCount = maxIndex + 1;
  const canNavigate = maxIndex > 0;
  const pageIndex = Math.min(index, maxIndex);

  useEffect(() => {
    if (!canNavigate) return;
    const id = window.setInterval(() => {
      setIndex((i) => {
        const c = Math.min(i, maxIndex);
        return c >= maxIndex ? 0 : c + 1;
      });
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [canNavigate, maxIndex]);

  const showPrev = useCallback(() => {
    setIndex((current) => {
      const c = Math.min(current, maxIndex);
      return (c - 1 + pageCount) % pageCount;
    });
  }, [maxIndex, pageCount]);

  const showNext = useCallback(() => {
    setIndex((current) => {
      const c = Math.min(current, maxIndex);
      return (c + 1) % pageCount;
    });
  }, [maxIndex, pageCount]);

  if (flyers.length === 0) return null;

  const translatePx = pageIndex * (slideW + GAP_PX);

  return (
    <div
      ref={viewportRef}
      className="relative w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
    >
      <div
        className="flex gap-2 transition-transform duration-500 ease-out"
        style={{
          transform: slideW > 0 ? `translateX(-${translatePx}px)` : undefined,
        }}
      >
        {flyers.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative aspect-[4/5] shrink-0 overflow-hidden bg-muted"
            style={{ width: slideW > 0 ? slideW : "100%" }}
          >
            <Image
              src={src}
              alt={`Flyer ${i + 1}`}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
              className="h-full w-full object-contain"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {canNavigate && (
        <>
          <button
            type="button"
            aria-label="Flyer anterior"
            onClick={showPrev}
            className="absolute top-1/2 left-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-lg font-semibold text-white transition-colors hover:bg-black/60"
          >
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            aria-label="Flyer siguiente"
            onClick={showNext}
            className="absolute top-1/2 right-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-lg font-semibold text-white transition-colors hover:bg-black/60"
          >
            <span aria-hidden>›</span>
          </button>
        </>
      )}

      {canNavigate && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-14 bg-gradient-to-t from-black/55 to-transparent" />
      )}

      {canNavigate && (
        <div className="absolute right-0 bottom-2 left-0 z-[2] flex justify-center gap-2">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ver grupo de flyers ${i + 1}`}
              aria-current={i === pageIndex}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2.5 rounded-full transition-all",
                i === pageIndex ? "w-7 bg-white" : "w-2.5 bg-white/60 hover:bg-white/85",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
