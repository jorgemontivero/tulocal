"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn, signInWithGoogle, signUp } from "@/app/auth/actions";
import { signInSchema, signUpSchema } from "@/lib/auth-schemas";

const brandSans = Poppins({
  subsets: ["latin"],
  weight: ["800"],
  style: ["italic"],
  display: "swap",
});

function AuthTabForm({
  mode,
  onSuccess,
}: {
  mode: "signin" | "signup";
  onSuccess: (message: string) => void;
}) {
  const isSignUp = mode === "signup";
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    defaultValues: isSignUp
      ? { nombre: "", apellido: "", celular: "", email: "", password: "" }
      : { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);

    startTransition(async () => {
      const result = isSignUp
        ? await signUp(values)
        : await signIn({ email: values.email, password: values.password });

      if (result.error) {
        setServerError(result.error);
        return;
      }

      onSuccess(result.success ?? "Operacion exitosa.");
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isSignUp && (
        <>
          <div className="space-y-1.5">
            <label htmlFor="signup-nombre" className="text-sm font-semibold text-slate-900">
              Nombre
            </label>
            <Input
              id="signup-nombre"
              type="text"
              placeholder="Juan"
              autoComplete="given-name"
              {...form.register("nombre")}
            />
            {form.formState.errors.nombre && (
              <p className="text-xs text-red-600">{form.formState.errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-apellido" className="text-sm font-semibold text-slate-900">
              Apellido
            </label>
            <Input
              id="signup-apellido"
              type="text"
              placeholder="Perez"
              autoComplete="family-name"
              {...form.register("apellido")}
            />
            {form.formState.errors.apellido && (
              <p className="text-xs text-red-600">{form.formState.errors.apellido.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-celular" className="text-sm font-semibold text-slate-900">
              Celular
            </label>
            <Input
              id="signup-celular"
              type="tel"
              placeholder="11 2345 6789"
              autoComplete="tel"
              {...form.register("celular")}
            />
            {form.formState.errors.celular && (
              <p className="text-xs text-red-600">{form.formState.errors.celular.message}</p>
            )}
          </div>
        </>
      )}

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
          autoComplete={isSignUp ? "new-password" : "current-password"}
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
        )}
        {!isSignUp ? (
          <div className="text-right">
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Olvide mi contrasena
            </Link>
          </div>
        ) : null}
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
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isGooglePending, startGoogleTransition] = useTransition();
  const passwordUpdated = searchParams.get("password") === "updated";
  const verificationFailed = searchParams.get("error") === "VerificationFailed";

  return (
    <Card className="w-full border border-zinc-200 bg-white shadow-sm">
      <CardHeader className="space-y-0">
        <Link
          href="/"
          className="mb-4 flex items-center justify-center gap-3 rounded-lg outline-offset-4 hover:opacity-90"
        >
          <Image
            src="/logo-tulocal.png"
            alt=""
            width={200}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
          <span
            className={`${brandSans.className} text-2xl font-extrabold italic tracking-tight text-slate-900`}
          >
            Tu Local
          </span>
        </Link>
        <CardDescription className="text-center text-slate-700">
          Accede a tu cuenta o registrate para publicar tu local.
        </CardDescription>
        {verificationFailed ? (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          >
            <p className="font-semibold">No pudimos verificar tu correo.</p>
            <p className="mt-1 text-red-800">
              El enlace de verificación es inválido o ha expirado. Por favor, intenta iniciar
              sesión o regístrate de nuevo para recibir un nuevo enlace.
            </p>
          </div>
        ) : passwordUpdated ? (
          <div
            role="status"
            className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          >
            <p className="font-semibold">Tu contrasena se actualizo correctamente.</p>
            <p className="mt-1 text-emerald-800">
              Ya podes iniciar sesion con tu nueva contrasena o ir al panel si seguis conectado.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50"
                onClick={() => router.push("/dashboard")}
              >
                Ir al panel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => router.replace("/login")}
              >
                Cerrar aviso
              </Button>
            </div>
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        {!verificationFailed && message ? (
          <div
            role="status"
            className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          >
            <p className="font-semibold">Registro exitoso.</p>
            <p className="mt-1 text-emerald-800">{message}</p>
          </div>
        ) : null}

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
          className="w-full"
        >
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
                setActiveTab("signup");
              }}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-4 space-y-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-500">o continuar con</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 w-full border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
            disabled={isGooglePending}
            onClick={() => {
              setGoogleError(null);
              startGoogleTransition(async () => {
                const result = await signInWithGoogle();
                if (result.error) {
                  setGoogleError(result.error);
                  return;
                }
                if (result.redirectTo) {
                  window.location.assign(result.redirectTo);
                  return;
                }
                setGoogleError("No pudimos iniciar sesión con Google. Intenta nuevamente.");
              });
            }}
          >
            <LogIn className="size-4" />
            {isGooglePending ? "Redirigiendo..." : "Continuar con Google"}
          </Button>

          {googleError && <p className="text-sm text-red-600">{googleError}</p>}
        </div>
      </CardContent>
    </Card>
  );
}