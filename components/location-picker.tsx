"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, LocateFixed, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATAMARCA_DEFAULT = { lat: -28.4696, lng: -65.7852 };

const LocationPickerMap = dynamic(
  () => import("@/components/location-picker-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100">
        <p className="text-sm text-zinc-500">Cargando mapa…</p>
      </div>
    ),
  },
);

type LatLng = { lat: number; lng: number };

type NominatimAddress = {
  road?: string;
  pedestrian?: string;
  footway?: string;
  path?: string;
  cycleway?: string;
  house_number?: string;
};

type NominatimReverseResponse = {
  display_name?: string;
  address?: NominatimAddress;
};

type NominatimSearchResponseItem = {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
};

export type LocationPickerProps = {
  latitude: string;
  longitude: string;
  address: string;
  onLatitudeChange: (v: string) => void;
  onLongitudeChange: (v: string) => void;
  onAddressChange: (v: string) => void;
};

function buildAddressLabel(
  displayName: string | undefined,
  address: NominatimAddress | undefined,
): string {
  const street =
    address?.road ?? address?.pedestrian ?? address?.footway ?? address?.path ?? address?.cycleway;
  const number = address?.house_number?.trim();
  const normalizedStreet = street?.trim();

  if (normalizedStreet && number) {
    return `${normalizedStreet} ${number}`;
  }
  if (normalizedStreet) {
    return normalizedStreet;
  }
  return String(displayName ?? "").trim();
}

export function LocationPicker({
  latitude,
  longitude,
  address,
  onLatitudeChange,
  onLongitudeChange,
  onAddressChange,
}: LocationPickerProps) {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [flyTo, setFlyTo] = useState<LatLng | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const hasPosition = latitude !== "" && longitude !== "";
  const position: LatLng = hasPosition
    ? { lat: Number.parseFloat(latitude), lng: Number.parseFloat(longitude) }
    : CATAMARCA_DEFAULT;

  const updatePosition = useCallback(
    (ll: LatLng) => {
      onLatitudeChange(String(ll.lat));
      onLongitudeChange(String(ll.lng));
    },
    [onLatitudeChange, onLongitudeChange],
  );

  const handlePositionChange = useCallback(
    async (ll: LatLng) => {
      updatePosition(ll);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${ll.lat}&lon=${ll.lng}&format=json&accept-language=es&addressdetails=1`,
          { headers: { "User-Agent": "tulocal.com.ar" } },
        );
        if (res.ok) {
          const data = (await res.json()) as NominatimReverseResponse;
          const nextAddress = buildAddressLabel(data.display_name, data.address);
          if (nextAddress) {
            onAddressChange(nextAddress);
          }
        }
      } catch {
        /* silent */
      }
    },
    [updatePosition, onAddressChange],
  );

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no soporta geolocalización.");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const ll = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        updatePosition(ll);
        setFlyTo({ ...ll });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${ll.lat}&lon=${ll.lng}&format=json&accept-language=es&addressdetails=1`,
            { headers: { "User-Agent": "tulocal.com.ar" } },
          );
          if (res.ok) {
            const data = (await res.json()) as NominatimReverseResponse;
            const nextAddress = buildAddressLabel(data.display_name, data.address);
            if (nextAddress) onAddressChange(nextAddress);
          }
        } catch {
          /* silent */
        }
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Permiso de ubicación denegado. Habilitalo en tu navegador."
            : "No pudimos obtener tu ubicación. Intentá de nuevo.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, [updatePosition, onAddressChange]);

  const runSearch = useCallback(async () => {
    const q = searchRef.current?.value.trim();
    if (!q) return;

    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=es&addressdetails=1`,
        { headers: { "User-Agent": "tulocal.com.ar" } },
      );
      if (res.ok) {
        const results = (await res.json()) as NominatimSearchResponseItem[];
        if (results[0]) {
          const ll = {
            lat: Number.parseFloat(results[0].lat),
            lng: Number.parseFloat(results[0].lon),
          };
          updatePosition(ll);
          setFlyTo({ ...ll });
          const nextAddress = buildAddressLabel(results[0].display_name, results[0].address);
          if (nextAddress) onAddressChange(nextAddress);
        }
      }
    } catch {
      /* silent */
    }
    setSearchLoading(false);
  }, [updatePosition, onAddressChange]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        runSearch();
      }
    },
    [runSearch],
  );

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-slate-900">
          Ubicación <span className="font-normal text-zinc-500">(opcional)</span>
        </label>
        <Button
          type="button"
          variant="outline"
          onClick={handleGeolocate}
          disabled={geoLoading}
          className="h-8 gap-1.5 border-emerald-300 text-xs text-emerald-800 hover:bg-emerald-50"
        >
          {geoLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <LocateFixed className="size-3.5" />
          )}
          {geoLoading ? "Obteniendo…" : "Usar mi ubicación"}
        </Button>
      </div>

      {geoError && <p className="text-xs text-red-600">{geoError}</p>}

      <div className="flex gap-2">
        <Input
          ref={searchRef}
          type="text"
          placeholder="Buscar dirección… Ej: República 400, Catamarca"
          onKeyDown={handleSearchKeyDown}
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="outline"
          disabled={searchLoading}
          onClick={runSearch}
          className="h-10 shrink-0 border-zinc-300 px-3"
        >
          {searchLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
        </Button>
      </div>

      <LocationPickerMap
        position={position}
        flyTo={flyTo}
        onPositionChange={handlePositionChange}
      />

      <p className="text-xs text-zinc-500">
        Hacé clic en el mapa o arrastrá el pin para ajustar la ubicación exacta.
      </p>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700">Dirección</label>
        <Input
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Ej: Av. Güemes 450, San Fernando del Valle de Catamarca"
          autoComplete="street-address"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Latitud</label>
          <Input
            value={latitude}
            readOnly
            placeholder="-28.4696"
            className="bg-zinc-100 text-zinc-600"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Longitud</label>
          <Input
            value={longitude}
            readOnly
            placeholder="-65.7852"
            className="bg-zinc-100 text-zinc-600"
          />
        </div>
      </div>

      {hasPosition && (
        <p className="text-xs text-emerald-700">
          Ubicación capturada correctamente.
        </p>
      )}
    </div>
  );
}
