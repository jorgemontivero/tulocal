"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar() {
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
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);

    return () => clearTimeout(timeout);
  }, [value]);

  useEffect(() => {
    const nextQuery = debouncedValue.trim();
    const currentQuery = qParam.trim();

    // Evita reemplazos redundantes (causa principal del loop).
    if (nextQuery === currentQuery) return;

    const params = new URLSearchParams(searchParams.toString());
    if (nextQuery) {
      params.set("q", nextQuery);
    } else {
      params.delete("q");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [debouncedValue, qParam, pathname, router, searchParams]);

  return (
    <div className="relative mt-6 max-w-xl">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
      <Input
        className="h-11 bg-white pl-9"
        placeholder="Buscar comercios, rubros o productos"
        aria-label="Buscar comercios"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
}
