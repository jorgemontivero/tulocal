import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAdminUser } from "@/lib/auth-admin";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (!(await isAdminUser(supabase, user))) redirect("/");

  return <>{children}</>;
}
