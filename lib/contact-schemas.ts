import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre."),
  email: z.email("Ingresa un email valido."),
  phone: z
    .string()
    .trim()
    .max(40, "El telefono no puede superar 40 caracteres.")
    .refine(
      (s) => s.length === 0 || s.replace(/\D/g, "").length >= 6,
      "Si indicas telefono, inclui al menos 6 digitos.",
    ),
  subject: z
    .string()
    .trim()
    .min(3, "El asunto es demasiado corto.")
    .max(180, "El asunto no puede superar 180 caracteres."),
  message: z
    .string()
    .trim()
    .min(10, "Escribi un mensaje mas detallado (al menos 10 caracteres).")
    .max(4000, "El mensaje no puede superar 4000 caracteres."),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
