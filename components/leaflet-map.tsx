"use client";

import { useEffect } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BasemapKey, MapShop } from "@/components/shop-map";

import "leaflet/dist/leaflet.css";

const defaultIcon = L.divIcon({
  className: "shop-default-marker",
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="
        width: 26px;
        height: 26px;
        border-radius: 9999px;
        background: radial-gradient(circle at 30% 30%, #34d399 0%, #10b981 55%, #047857 100%);
        border: 2px solid #ffffff;
        box-shadow: 0 6px 16px rgba(6, 95, 70, 0.45);
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #ffffff;
        "></div>
      </div>
      <div style="
        margin-top: -1px;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 10px solid #047857;
        filter: drop-shadow(0 4px 4px rgba(6, 95, 70, 0.35));
      "></div>
    </div>
  `,
  iconSize: [26, 36],
  iconAnchor: [13, 36],
  popupAnchor: [0, -30],
});

const bronzeIcon = L.divIcon({
  className: "shop-bronze-marker",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 9999px;
      background: #10b981;
      border: 2px solid #ffffff;
      box-shadow: 0 3px 10px rgba(6, 95, 70, 0.35);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});

L.Marker.prototype.options.icon = defaultIcon;

function logoMarkerIcon(logoUrl: string): L.DivIcon {
  const safeUrl = encodeURI(logoUrl);
  return L.divIcon({
    className: "shop-logo-marker",
    html: `
      <div style="
        width: 42px;
        height: 42px;
        border-radius: 9999px;
        overflow: hidden;
        border: 2px solid #10b981;
        box-shadow: 0 4px 14px rgba(0,0,0,0.28);
        background: white;
      ">
        <img
          src="${safeUrl}"
          alt=""
          style="width:100%;height:100%;object-fit:cover;display:block;"
        />
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -36],
  });
}

function shouldUseLogoMarker(shop: MapShop): boolean {
  return (
    (shop.plan_type === "oro" || shop.plan_type === "black") &&
    typeof shop.logo_url === "string" &&
    shop.logo_url.trim() !== ""
  );
}

function markerForShop(shop: MapShop): L.DivIcon {
  if (shouldUseLogoMarker(shop)) return logoMarkerIcon(shop.logo_url!);
  if (shop.plan_type === "bronce") return bronzeIcon;
  return defaultIcon;
}

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
  basemap: BasemapKey;
};

const BASEMAPS: Record<
  BasemapKey,
  {
    attribution: string;
    url: string;
    maxZoom?: number;
    minZoom?: number;
    subdomains?: string;
  }
> = {
  osm: {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 19,
  },
  dark: {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
    maxZoom: 20,
    subdomains: "abcd",
  },
  satellite: {
    attribution: "Tiles &copy; Esri",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
  },
  ign: {
    attribution:
      '&copy; <a href="https://www.ign.gob.ar/">Instituto Geográfico Nacional</a> + <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    url: "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png",
    minZoom: 3,
    maxZoom: 18,
  },
};

export default function LeafletMap({ shops, center, zoom, basemap }: LeafletMapProps) {
  const activeBasemap = BASEMAPS[basemap];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="z-0 h-[500px] w-full rounded-2xl border border-zinc-200 shadow-sm sm:h-[600px]"
    >
      <TileLayer
        attribution={activeBasemap.attribution}
        url={activeBasemap.url}
        minZoom={activeBasemap.minZoom}
        maxZoom={activeBasemap.maxZoom}
        {...(activeBasemap.subdomains ? { subdomains: activeBasemap.subdomains } : {})}
      />

      <FitBounds shops={shops} />

      {shops.map((shop) => (
        <Marker
          key={shop.id}
          position={[shop.latitude, shop.longitude]}
          icon={markerForShop(shop)}
        >
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
