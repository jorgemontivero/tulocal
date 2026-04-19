import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ShopLocationForm } from "./shop-location-form";

export default async function UbicacionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id, address, latitude, longitude")
    .eq("vendor_id", user.id)
    .maybeSingle();

  if (!shop) {
    redirect("/dashboard");
  }

  const row = shop as {
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };

  const latStr =
    row.latitude != null && Number.isFinite(Number(row.latitude)) ? String(row.latitude) : "";
  const lngStr =
    row.longitude != null && Number.isFinite(Number(row.longitude)) ? String(row.longitude) : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-zinc-950">
      <div className="w-full max-w-xl">
        <ShopLocationForm
          initialAddress={row.address ?? ""}
          initialLatitude={latStr}
          initialLongitude={lngStr}
        />
      </div>
    </main>
  );
}
