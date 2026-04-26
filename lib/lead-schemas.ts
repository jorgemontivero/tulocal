import { z } from "zod";

export const leadSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres."),
    contact_method: z.enum(["whatsapp", "email"], {
      error: "El método de contacto debe ser WhatsApp o Email.",
    }),
    contact_value: z.string().trim().min(1, "Ingresá tu dato de contacto."),
    source: z.string().trim().min(1),
    age_range: z
      .enum(["18-24", "25-34", "35-44", "45+"])
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
    gender: z
      .enum(["masculino", "femenino", "otro", "prefiero no decirlo"])
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
  })
  .superRefine((data, ctx) => {
    if (data.contact_method === "whatsapp") {
      const digits = data.contact_value.replace(/\D/g, "");
      if (digits.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingresá un número de WhatsApp válido (mínimo 8 dígitos).",
          path: ["contact_value"],
        });
      }
      return;
    }

    const emailCheck = z.email("Ingresá un email válido.");
    const emailResult = emailCheck.safeParse(data.contact_value.trim().toLowerCase());
    if (!emailResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: emailResult.error.issues[0]?.message ?? "Ingresá un email válido.",
        path: ["contact_value"],
      });
    }
  });

export type LeadFormInput = z.output<typeof leadSchema>;
export type LeadFormValues = z.input<typeof leadSchema>;
