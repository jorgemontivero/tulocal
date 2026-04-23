"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@/app/auth/actions";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/lib/auth-schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await requestPasswordReset(values);
      if (result.error) {
        setServerError(result.error);
        return;
      }
      setSuccessMessage(result.success ?? "Te enviamos el enlace de recuperacion.");
      form.reset();
    });
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md border border-zinc-200 bg-white shadow-sm">
        <CardHeader className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">Recuperar contrasena</h1>
          <CardDescription className="text-slate-600">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contrasena.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="text-sm font-semibold text-slate-900">
                Email
              </label>
              <Input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="tuemail@ejemplo.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

            <Button
              type="submit"
              disabled={isPending}
              className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isPending ? "Enviando..." : "Enviar enlace de recuperacion"}
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

