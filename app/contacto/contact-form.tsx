"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactFormSchema, type ContactFormInput } from "@/lib/contact-schemas";
import { sendContactMessage } from "@/app/contacto/actions";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setStatus("idle");
    setErrorMessage(null);
    const result = await sendContactMessage(values);
    if (result.ok) {
      setStatus("success");
      return;
    }
    setStatus("error");
    setErrorMessage(result.error ?? "Ocurrio un error.");
  });

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-700 dark:bg-emerald-900/25"
      >
        <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Mensaje enviado</p>
        <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
          Gracias por escribirnos. Te responderemos a la brevedad al correo que indicaste.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="contact-name" className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nombre
        </label>
        <Input
          id="contact-name"
          autoComplete="name"
          placeholder="Tu nombre"
          aria-invalid={!!form.formState.errors.name}
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-email" className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Email
        </label>
        <Input
          id="contact-email"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          aria-invalid={!!form.formState.errors.email}
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-phone" className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Teléfono <span className="font-normal text-zinc-500 dark:text-zinc-400">(opcional)</span>
        </label>
        <Input
          id="contact-phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="Ej: 3834123456 o +54 9 383 ..."
          aria-invalid={!!form.formState.errors.phone}
          {...form.register("phone")}
        />
        {form.formState.errors.phone && (
          <p className="text-xs text-red-600">{form.formState.errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-subject" className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Asunto
        </label>
        <Input
          id="contact-subject"
          placeholder="Motivo de tu consulta"
          aria-invalid={!!form.formState.errors.subject}
          {...form.register("subject")}
        />
        {form.formState.errors.subject && (
          <p className="text-xs text-red-600">{form.formState.errors.subject.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Mensaje
        </label>
        <Textarea
          id="contact-message"
          rows={5}
          placeholder="Escribi tu mensaje..."
          aria-invalid={!!form.formState.errors.message}
          {...form.register("message")}
        />
        {form.formState.errors.message && (
          <p className="text-xs text-red-600">{form.formState.errors.message.message}</p>
        )}
      </div>

      {status === "error" && errorMessage ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200"
        >
          {errorMessage}
        </div>
      ) : null}

      <Button
        type="submit"
        className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Enviando..." : "Enviar mensaje"}
      </Button>
    </form>
  );
}
