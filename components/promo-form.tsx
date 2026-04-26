"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";

import { leadSchema, type LeadFormValues } from "@/lib/lead-schemas";
import { submitVisitorLead } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AGE_RANGE_OPTIONS = [
  { value: "18-24", label: "18 – 24 años" },
  { value: "25-34", label: "25 – 34 años" },
  { value: "35-44", label: "35 – 44 años" },
  { value: "45+", label: "45 años o más" },
];

const GENDER_OPTIONS = [
  { value: "femenino", label: "Femenino" },
  { value: "masculino", label: "Masculino" },
  { value: "otro", label: "Otro" },
  { value: "prefiero no decirlo", label: "Prefiero no decirlo" },
];

interface PromoFormProps {
  source: string;
  onSuccess: () => void;
}

export function PromoForm({ source, onSuccess }: PromoFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      contact_method: "whatsapp",
      contact_value: "",
      source,
      age_range: "",
      gender: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    const result = await submitVisitorLead({ ...values, source, honeypot });
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    onSuccess();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Honeypot anti-bot: usuarios reales no completan este campo */}
      <div className="sr-only" aria-hidden>
        <label htmlFor="lead-company">Empresa</label>
        <input
          id="lead-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Fila 1: Nombre */}
      <div className="space-y-1">
        <label
          htmlFor="lead-name"
          className="text-sm font-semibold text-slate-900"
        >
          Nombre <span className="text-red-500">*</span>
        </label>
        <Input
          id="lead-name"
          placeholder="Tu nombre"
          autoComplete="given-name"
          aria-invalid={!!form.formState.errors.name}
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-xs text-red-600">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* Fila 2: WhatsApp */}
      <div className="space-y-1">
        <input type="hidden" {...form.register("contact_method")} value="whatsapp" />
        <label
          htmlFor="lead-contact-value"
          className="text-sm font-semibold text-slate-900"
        >
          WhatsApp <span className="text-red-500">*</span>
        </label>
        <Input
          id="lead-contact-value"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Ej: 3834 123456"
          aria-invalid={!!form.formState.errors.contact_value}
          {...form.register("contact_value")}
        />
        {form.formState.errors.contact_value && (
          <p className="text-xs text-red-600">
            {form.formState.errors.contact_value.message}
          </p>
        )}
      </div>

      {/* Fila 3: Edad + Género (secundarios) */}
      <div className="flex gap-2">
        <div className="space-y-1 flex-1">
          <label
            htmlFor="lead-age-range"
            className="text-xs font-medium text-slate-500"
          >
            Rango de edad{" "}
            <span className="font-normal">(opcional)</span>
          </label>
          <Controller
            control={form.control}
            name="age_range"
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="lead-age-range"
                  className="w-full h-8 text-xs"
                >
                  <SelectValue placeholder="Rango…" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_RANGE_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1 flex-1">
          <label
            htmlFor="lead-gender"
            className="text-xs font-medium text-slate-500"
          >
            Género{" "}
            <span className="font-normal">(opcional)</span>
          </label>
          <Controller
            control={form.control}
            name="gender"
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="lead-gender"
                  className="w-full h-8 text-xs"
                >
                  <SelectValue placeholder="Género…" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Error del servidor */}
      {serverError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={form.formState.isSubmitting}
        className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
      >
        {form.formState.isSubmitting ? (
          "Enviando…"
        ) : (
          <>
            <CheckCircle2 className="mr-1.5 size-4" />
            Quiero mis descuentos
          </>
        )}
      </Button>
    </form>
  );
}

/* Estado de éxito inline (se muestra al completar onSuccess desde el padre) */
export function PromoFormSuccess() {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 py-4 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="size-6 text-emerald-600" />
      </span>
      <p className="text-base font-semibold text-slate-900">
        ¡Ya estás participando!
      </p>
      <p className="text-sm text-slate-600">
        Te avisamos cuando haya sorteos y cupones en Catamarca.
      </p>
    </div>
  );
}
