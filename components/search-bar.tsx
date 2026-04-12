"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchBarProps = {
  variant?: "default" | "compact";
  /** `debounce`: actualiza la URL mientras escribís (header). `submit`: solo al enviar el formulario (Enter o botón). */
  updateOn?: "debounce" | "submit";
  className?: string;
};

function mergeHomeQuery(searchParams: URLSearchParams, nextQuery: string): string {
  const params = new URLSearchParams(searchParams.toString());
  if (nextQuery) {
    params.set("q", nextQuery);
  } else {
    params.delete("q");
  }
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function SearchBar({
  variant = "default",
  updateOn = "debounce",
  className,
}: SearchBarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const qParam = searchParams.get("q") ?? "";
  const [value, setValue] = useState(qParam);
  const [debouncedValue, setDebouncedValue] = useState(qParam);

  useEffect(() => {
    setValue(qParam);
    setDebouncedValue(qParam);
  }, [qParam]);

  useEffect(() => {
    if (updateOn !== "debounce") return;

    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);

    return () => clearTimeout(timeout);
  }, [value, updateOn]);

  useEffect(() => {
    if (updateOn !== "debounce") return;

    const nextQuery = debouncedValue.trim();
    const currentQuery = qParam.trim();

    if (nextQuery === currentQuery) return;

    if (pathname === "/") {
      router.replace(mergeHomeQuery(searchParams, nextQuery));
      return;
    }

    if (nextQuery) {
      router.replace(`/?q=${encodeURIComponent(nextQuery)}`);
    } else {
      router.replace(pathname);
    }
  }, [debouncedValue, qParam, pathname, router, searchParams, updateOn]);

  function applyQuery(next: string) {
    const nextQuery = next.trim();
    if (pathname === "/") {
      router.push(mergeHomeQuery(searchParams, nextQuery));
      return;
    }
    if (nextQuery) {
      router.push(`/?q=${encodeURIComponent(nextQuery)}`);
    } else {
      router.push(pathname);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (updateOn !== "submit") return;
    applyQuery(value);
  }

  const debounceInputClassName = cn(
    "bg-white pl-9",
    variant === "compact" ? "h-10 text-sm" : "h-11",
  );

  if (updateOn === "submit") {
    return (
      <form
        className={cn(
          "relative w-full",
          variant === "default" && "mt-6 max-w-xl",
          variant === "compact" && "mt-0",
          className,
        )}
        onSubmit={onSubmit}
        role="search"
      >
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-zinc-500"
          aria-hidden
        />
        <Input
          className={cn(
            "bg-white pl-9 pr-28",
            variant === "compact" ? "h-10 text-sm" : "h-14 rounded-xl text-base sm:text-lg",
          )}
          placeholder="Buscar comercios o productos"
          aria-label="Buscar comercios"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button
          type="submit"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
          aria-label="Buscar"
        >
          Buscar
        </button>
      </form>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full",
        variant === "default" && "mt-6 max-w-xl",
        variant === "compact" && "mt-0",
        className,
      )}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
      <Input
        className={debounceInputClassName}
        placeholder="Buscar comercios o productos"
        aria-label="Buscar comercios"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
}
