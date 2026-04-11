import { redirect } from "next/navigation";
import { NewShopForm } from "./new-shop-form";
import { createClient } from "@/utils/supabase/server";

export default async function NewShopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existingShop } = await supabase
    .from("shops")
    .select("*")
    .eq("vendor_id", user.id)
    .maybeSingle();
  const shopData = existingShop as
    | {
        name?: string | null;
        category?: string | null;
        whatsapp_number?: string | null;
        instagram_username?: string | null;
        description?: string | null;
        logo_url?: string | null;
      }
    | null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl">
        <NewShopForm
          initialCategory={shopData?.category ?? ""}
          initialValues={{
            name: shopData?.name ?? "",
            whatsapp: shopData?.whatsapp_number ?? "",
            instagram: shopData?.instagram_username ?? "",
            description: shopData?.description ?? "",
          }}
          initialLogoUrl={shopData?.logo_url ?? undefined}
        />
      </div>
    </main>
  );
}
