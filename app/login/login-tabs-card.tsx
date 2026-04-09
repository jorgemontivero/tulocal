"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn, signUp } from "@/app/auth/actions";

const authSchema = z.object({
  email: z.email("Ingresa un email valido."),
  password: z
    .string()
    .min(6, "La contrasena debe tener al menos 6 caracteres."),
});

type AuthFormValues = z.infer<typeof authSchema>;

function AuthTabForm({
  mode,
  onSuccess,
}: {
  mode: "signin" | "signup";
  onSuccess: (message: string) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);

    startTransition(async () => {
      const result = mode === "signin" ? await signIn(values) : await signUp(values);

      if (result.error) {
        setServerError(result.error);
        return;
      }

      onSuccess(result.success ?? "Operacion exitosa.");
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor={`${mode}-email`} className="text-sm font-semibold text-slate-900">
          Email
        </label>
        <Input
          id={`${mode}-email`}
          type="email"
          placeholder="tuemail@ejemplo.com"
          autoComplete="email"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${mode}-password`} className="text-sm font-semibold text-slate-900">
          Contrasena
        </label>
        <Input
          id={`${mode}-password`}
          type="password"
          placeholder="******"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <Button
        type="submit"
        className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700"
        disabled={isPending}
      >
        {isPending
          ? "Procesando..."
          : mode === "signin"
            ? "Iniciar Sesion"
            : "Crear Cuenta"}
      </Button>
    </form>
  );
}

export function LoginTabsCard() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <Card className="w-full border border-zinc-200 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-center text-2xl font-semibold text-slate-900">
          <Link href="/" className="hover:text-emerald-700">
            tulocal.com.ar
          </Link>
        </CardTitle>
        <CardDescription className="text-center text-slate-700">
          Accede a tu cuenta o registrate para publicar tu local.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Iniciar Sesion</TabsTrigger>
            <TabsTrigger value="signup">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-4">
            <AuthTabForm
              mode="signin"
              onSuccess={() => {
                setMessage(null);
                router.push("/dashboard");
              }}
            />
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <AuthTabForm
              mode="signup"
              onSuccess={(successMessage) => {
                setMessage(successMessage);
              }}
            />
          </TabsContent>
        </Tabs>

        {message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}
      </CardContent>
    </Card>
  );
}