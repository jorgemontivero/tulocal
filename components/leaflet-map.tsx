"use client";

import { useEffect } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MapShop } from "@/components/shop-map";

import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

function FitBounds({ shops }: { shops: MapShop[] }) {
  const map = useMap();

  useEffect(() => {
    if (shops.length === 0) return;
    if (shops.length === 1) {
      map.setView([shops[0].latitude, shops[0].longitude], 16);
      return;
    }
    const bounds = L.latLngBounds(
      shops.map((s) => [s.latitude, s.longitude] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  }, [map, shops]);

  return null;
}

type LeafletMapProps = {
  shops: MapShop[];
  center: [number, number];
  zoom: number;
};

export default function LeafletMap({ shops, center, zoom }: LeafletMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="z-0 h-[500px] w-full rounded-2xl border border-zinc-200 shadow-sm sm:h-[600px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds shops={shops} />

      {shops.map((shop) => (
        <Marker key={shop.id} position={[shop.latitude, shop.longitude]}>
          <Popup minWidth={200} maxWidth={260}>
            <div className="flex items-start gap-3 py-1">
              <Avatar className="size-10 shrink-0 ring-1 ring-zinc-200">
                {shop.logo_url ? (
                  <AvatarImage src={shop.logo_url} alt={`Logo de ${shop.name}`} />
                ) : null}
                <AvatarFallback className="bg-emerald-100 text-sm font-semibold text-emerald-800">
                  {shop.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <Link
                  href={`/${shop.slug}`}
                  className="text-sm font-semibold leading-tight text-emerald-800 underline-offset-2 hover:underline"
                >
                  {shop.name}
                </Link>
                {shop.address && (
                  <p className="mt-0.5 text-xs leading-snug text-zinc-500">
                    {shop.address}
                  </p>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
