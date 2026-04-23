import { Suspense } from "react";
import { LoginTabsCard } from "./login-tabs-card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100" />}>
          <LoginTabsCard />
        </Suspense>
      </div>
    </main>
  );
}