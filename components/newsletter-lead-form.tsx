"use client";

import { useState } from "react";
import { captureLead } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NewsletterLeadFormProps = {
  source: string;
  compact?: boolean;
  dark?: boolean;
  title?: string;
  description?: string;
};

export function NewsletterLeadForm({
  source,
  compact = false,
  dark = false,
  title = "Recibí promos y descuentos",
  description = "Sumate gratis y enterate primero de cupones y beneficios de comercios locales.",
}: NewsletterLeadFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setStatus("error");
      setMessage("Ingresa un email valido.");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setMessage(null);

    const result = await captureLead(normalizedEmail, source);
    if ("error" in result) {
      setStatus("error");
      setMessage(result.error);
      setIsSubmitting(false);
      return;
    }

    setStatus("success");
    setMessage("Listo. Revisa tu casilla, te enviamos un cupon de bienvenida.");
    setEmail("");
    setIsSubmitting(false);
  }

  const titleClass = dark ? "text-white" : "text-slate-900";
  const descriptionClass = dark ? "text-emerald-100/90" : "text-slate-600";
  const inputClass = dark
    ? "border-white/30 bg-white/10 text-white placeholder:text-emerald-100/70"
    : "";
  const successClass = dark
    ? "border-emerald-300/40 bg-emerald-500/20 text-emerald-100"
    : "border-emerald-200 bg-emerald-50 text-emerald-800";
  const errorClass = dark
    ? "border-red-300/40 bg-red-500/20 text-red-100"
    : "border-red-200 bg-red-50 text-red-800";

  return (
    <form onSubmit={onSubmit} className={compact ? "space-y-2" : "space-y-3"}>
      <div className={compact ? "space-y-1" : "space-y-1.5"}>
        <p className={`font-semibold ${compact ? "text-sm" : "text-lg"} ${titleClass}`}>
          {title}
        </p>
        <p className={`${compact ? "text-xs" : "text-sm"} ${descriptionClass}`}>
          {description}
        </p>
      </div>

      <div className={compact ? "flex flex-col gap-2 sm:flex-row" : "flex flex-col gap-2 sm:flex-row"}>
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
          aria-label="Email para recibir promos"
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {isSubmitting ? "Enviando..." : "Recibí promos de Catamarca"}
        </Button>
      </div>

      {status !== "idle" && message ? (
        <p
          role={status === "error" ? "alert" : "status"}
          className={`rounded-md border px-3 py-2 text-xs ${status === "success" ? successClass : errorClass}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

