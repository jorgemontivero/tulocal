"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/utils/supabase/client";
import {
  type UpdatePasswordInput,
  updatePasswordSchema,
} from "@/lib/auth-schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        setServerError(
          "No pudimos actualizar tu contrasena. Abre de nuevo el enlace de recuperacion.",
        );
        return;
      }

      setSuccessMessage("Tu contrasena se actualizo correctamente.");
      form.reset();
      router.push("/login?password=updated");
    });
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md border border-zinc-200 bg-white shadow-sm">
        <CardHeader className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">Nueva contrasena</h1>
          <CardDescription className="text-slate-600">
            Define una nueva contrasena para ingresar a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-sm font-semibold text-slate-900">
                Nueva contrasena
              </label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="******"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="text-sm font-semibold text-slate-900"
              >
                Confirmar contrasena
              </label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="******"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

            <Button
              type="submit"
              disabled={isPending}
              className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isPending ? "Actualizando..." : "Actualizar contrasena"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600">
            <Link href="/login" className="font-medium text-emerald-700 hover:underline">
              Volver al login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

