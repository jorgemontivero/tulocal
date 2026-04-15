import { z } from "zod";

export const leadSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres."),
    contact_method: z.enum(["whatsapp", "email"], {
      error: "Seleccioná un método de contacto.",
    }),
    contact_value: z.string().trim().min(1, "Ingresá tu dato de contacto."),
    source: z.string().min(1),
    age_range: z.string().optional(),
    gender: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.contact_method === "email") {
      const ok = z.email().safeParse(data.contact_value).success;
      if (!ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingresá un email válido.",
          path: ["contact_value"],
        });
      }
    }
    if (data.contact_method === "whatsapp") {
      const digits = data.contact_value.replace(/\D/g, "");
      if (digits.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingresá un número de WhatsApp válido (mínimo 8 dígitos).",
          path: ["contact_value"],
        });
      }
    }
  });

export type LeadFormInput = z.infer<typeof leadSchema>;
