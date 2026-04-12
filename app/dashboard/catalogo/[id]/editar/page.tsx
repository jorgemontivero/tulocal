import Image from "next/image";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Poppins } from "next/font/google";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListingForm, type ListingFormInitial } from "@/app/dashboard/listing-form";
import { createClient } from "@/utils/supabase/server";

const brandSans = Poppins({
  subsets: ["latin"],
  weight: ["800"],
  style: ["italic"],
  display: "swap",
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarListingPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("vendor_id", user.id)
    .maybeSingle();

  if (!shop) {
    redirect("/dashboard");
  }

  const { data: row, error } = await supabase
    .from("listings")
    .select(
      "id,title,description,price,discount_percentage,is_promoted,image_urls,shop_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !row || row.shop_id !== shop.id) {
    notFound();
  }

  const listing: ListingFormInitial = {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    discount_percentage: row.discount_percentage,
    is_promoted: row.is_promoted,
    image_urls: row.image_urls,
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl space-y-4">
        <Card className="border border-zinc-200 bg-white shadow-sm">
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
                className={`${brandSans.className} text-2xl font-extrabold italic tracking-tight text-slate-900`}
              >
                Tu Local
              </span>
            </Link>
            <CardTitle className="text-2xl text-slate-900">Editar producto</CardTitle>
            <CardDescription className="text-slate-700">
              Modificá los datos de este item del catálogo.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">{listing.title}</CardTitle>
            <CardDescription className="text-slate-700">
              Los cambios se reflejan en tu página pública al guardar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ListingForm
              key={listing.id}
              mode="edit"
              listing={listing}
              fileInputId="listing-edit-images"
            />
            <Button
              render={<Link href="/dashboard" />}
              variant="outline"
              className="w-full border-zinc-300"
            >
              Volver al panel
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
