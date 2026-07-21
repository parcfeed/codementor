import { z } from "zod";

import { emailField, nameField, passwordField } from "@/lib/validation";

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Le mot de passe est obligatoire."),
});

export const registerSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
