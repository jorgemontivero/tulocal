"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";

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

type LatLng = { lat: number; lng: number };

function ClickHandler({ onMapClick }: { onMapClick: (ll: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function FlyToCenter({ center }: { center: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, Math.max(map.getZoom(), 16), { duration: 0.8 });
    }
  }, [map, center]);
  return null;
}

function DraggableMarker({
  position,
  onDragEnd,
}: {
  position: LatLng;
  onDragEnd: (ll: LatLng) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const m = markerRef.current;
        if (m) onDragEnd(m.getLatLng());
      },
    }),
    [onDragEnd],
  );

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

export type LocationPickerMapProps = {
  position: LatLng;
  flyTo: LatLng | null;
  onPositionChange: (ll: LatLng) => void;
};

export default function LocationPickerMap({
  position,
  flyTo,
  onPositionChange,
}: LocationPickerMapProps) {
  const handleClick = useCallback(
    (ll: LatLng) => onPositionChange(ll),
    [onPositionChange],
  );

  const handleDragEnd = useCallback(
    (ll: LatLng) => onPositionChange(ll),
    [onPositionChange],
  );

  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom
      className="z-0 h-[400px] w-full rounded-xl border border-zinc-200 shadow-sm"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onMapClick={handleClick} />
      <FlyToCenter center={flyTo} />
      <DraggableMarker position={position} onDragEnd={handleDragEnd} />
    </MapContainer>
  );
}
