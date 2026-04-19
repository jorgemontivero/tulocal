import { redirect } from "next/navigation";
import { NewShopForm } from "./new-shop-form";
import { fetchShopTaxonomy } from "@/lib/shop-taxonomy";
import { createClient } from "@/utils/supabase/server";
import { parseListingImageUrls } from "@/lib/listing-display";

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
        business_type?: string | null;
        category_id?: string | null;
        subcategory_id?: string | null;
        whatsapp_number?: string | null;
        instagram_username?: string | null;
        description?: string | null;
        logo_url?: string | null;
        plan_type?: string | null;
        flyer_urls?: unknown;
      }
    | null;

  const { categories, subcategories } = await fetchShopTaxonomy(supabase);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl">
        <NewShopForm
          taxonomyCategories={categories}
          taxonomySubcategories={subcategories}
          initialBusinessType={shopData?.business_type ?? null}
          initialCategoryId={shopData?.category_id ?? null}
          initialSubcategoryId={shopData?.subcategory_id ?? null}
          initialValues={{
            name: shopData?.name ?? "",
            whatsapp: shopData?.whatsapp_number ?? "",
            instagram: shopData?.instagram_username ?? "",
            description: shopData?.description ?? "",
          }}
          initialLogoUrl={shopData?.logo_url ?? undefined}
          initialPlanType={shopData?.plan_type ?? null}
          initialFlyerUrls={parseListingImageUrls(shopData?.flyer_urls)}
          hasExistingShop={!!existingShop}
        />
      </div>
    </main>
  );
}
