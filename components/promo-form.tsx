"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";

import { leadSchema, type LeadFormInput } from "@/lib/lead-schemas";
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

const CONTACT_METHOD_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
] as const;

const AGE_RANGE_OPTIONS = [
  { value: "18-24", label: "18 – 24 años" },
  { value: "25-34", label: "25 – 34 años" },
  { value: "35-44", label: "35 – 44 años" },
  { value: "45+", label: "45 años o más" },
];

const GENDER_OPTIONS = [
  { value: "femenino", label: "Femenino" },
  { value: "masculino", label: "Masculino" },
  { value: "no_binario", label: "No binario" },
  { value: "prefiero_no_decir", label: "Prefiero no decirlo" },
];

interface PromoFormProps {
  source: string;
  onSuccess: () => void;
}

export function PromoForm({ source, onSuccess }: PromoFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LeadFormInput>({
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

  const contactMethod = form.watch("contact_method");

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    const result = await submitVisitorLead({ ...values, source });
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    onSuccess();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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

      {/* Fila 2: Método + valor de contacto */}
      <div className="flex gap-2">
        <div className="space-y-1 w-36 shrink-0">
          <label
            htmlFor="lead-contact-method"
            className="text-sm font-semibold text-slate-900"
          >
            Contacto <span className="text-red-500">*</span>
          </label>
          <Controller
            control={form.control}
            name="contact_method"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="lead-contact-method"
                  className="w-full h-8"
                  aria-invalid={!!form.formState.errors.contact_method}
                >
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_METHOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.contact_method && (
            <p className="text-xs text-red-600">
              {form.formState.errors.contact_method.message}
            </p>
          )}
        </div>

        <div className="space-y-1 flex-1">
          <label
            htmlFor="lead-contact-value"
            className="text-sm font-semibold text-slate-900 invisible select-none"
            aria-hidden
          >
            Valor
          </label>
          <Input
            id="lead-contact-value"
            type={contactMethod === "email" ? "email" : "tel"}
            inputMode={contactMethod === "email" ? "email" : "tel"}
            autoComplete={contactMethod === "email" ? "email" : "tel"}
            placeholder={
              contactMethod === "email"
                ? "tu@email.com"
                : "Ej: 3834 123456"
            }
            aria-invalid={!!form.formState.errors.contact_value}
            {...form.register("contact_value")}
          />
          {form.formState.errors.contact_value && (
            <p className="text-xs text-red-600">
              {form.formState.errors.contact_value.message}
            </p>
          )}
        </div>
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
