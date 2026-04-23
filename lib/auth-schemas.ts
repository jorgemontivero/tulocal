import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Ingresa un email valido."),
  password: z
    .string()
    .min(6, "La contrasena debe tener al menos 6 caracteres."),
});

export const signUpSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresa tu nombre."),
  apellido: z.string().trim().min(1, "Ingresa tu apellido."),
  celular: z.string().trim().min(8, "Ingresa un celular valido."),
  email: z.email("Ingresa un email valido."),
  password: z
    .string()
    .min(6, "La contrasena debe tener al menos 6 caracteres."),
});

export const requestPasswordResetSchema = z.object({
  email: z.email("Ingresa un email valido."),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "La contrasena debe tener al menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Confirma tu nueva contrasena."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
