"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Poppins } from "next/font/google";
import { LocationPicker } from "@/components/location-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateShopLocation } from "@/app/dashboard/actions";

const brandSans = Poppins({
  subsets: ["latin"],
  weight: ["800"],
  style: ["italic"],
  display: "swap",
});

type Props = {
  initialAddress: string;
  initialLatitude: string;
  initialLongitude: string;
};

export function ShopLocationForm({
  initialAddress,
  initialLatitude,
  initialLongitude,
}: Props) {
  const [address, setAddress] = useState(initialAddress);
  const [latitude, setLatitude] = useState(initialLatitude);
  const [longitude, setLongitude] = useState(initialLongitude);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Card className="w-full border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <CardHeader className="space-y-2">
        <Link
          href="/"
          className="mb-1 flex items-center gap-3 rounded-lg outline-offset-4 hover:opacity-90"
        >
          <Image
            src="/logo-tulocal.png"
            alt=""
            width={200}
            height={48}
            className="h-10 w-auto object-contain"
          />
          <span
            className={`${brandSans.className} text-2xl font-extrabold italic tracking-tight text-slate-900 dark:text-zinc-100`}
          >
            Tu Local
          </span>
        </Link>
        <CardTitle className="text-2xl text-slate-900 dark:text-zinc-100">Ubicación del local</CardTitle>
        <CardDescription className="text-slate-700 dark:text-zinc-300">
          Ajustá el pin en el mapa o la dirección. Los cambios se guardan solo acá, sin pasar por el
          resto de datos del comercio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setIsSaving(true);
            try {
              const fd = new FormData();
              if (address.trim()) fd.set("address", address.trim());
              fd.set("latitude", latitude);
              fd.set("longitude", longitude);
              const r = await updateShopLocation(fd);
              if (!r.ok) {
                setError(r.error ?? "No pudimos guardar.");
                setIsSaving(false);
                return;
              }
              window.location.assign("/dashboard?success=ubicacion-guardada");
            } catch {
              setError("No pudimos guardar. Revisá tu conexión e intentá de nuevo.");
              setIsSaving(false);
            }
          }}
        >
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            address={address}
            onLatitudeChange={setLatitude}
            onLongitudeChange={setLongitude}
            onAddressChange={setAddress}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="submit"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={isSaving}
            >
              {isSaving ? "Guardando…" : "Guardar ubicación"}
            </Button>
            <Button
              type="button"
              variant="outline"
              render={<Link href="/dashboard" />}
              className="border-zinc-300 dark:border-zinc-600"
            >
              Volver al panel
            </Button>
            <Button
              type="button"
              variant="ghost"
              render={<Link href="/dashboard/nuevo" />}
              className="text-emerald-700 dark:text-emerald-300"
            >
              Ir a editar todos los datos
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
