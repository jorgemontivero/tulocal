"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SLIDE_MS = 5000;

export function ShopFlyersCarousel({ flyers }: { flyers: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (flyers.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % flyers.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [flyers.length]);

  if (flyers.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
      <div className="relative h-56 w-full sm:h-72">
        {flyers.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- URLs externas de storage
          <img
            key={`${src}-${i}`}
            src={src}
            alt={`Flyer ${i + 1}`}
            loading={i === 0 ? "eager" : "lazy"}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
              i === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>

      {flyers.length > 1 && (
        <div className="absolute right-0 bottom-2 left-0 flex justify-center gap-2">
          {flyers.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ver flyer ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2.5 rounded-full transition-all",
                i === index ? "w-7 bg-white" : "w-2.5 bg-white/60 hover:bg-white/85",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
