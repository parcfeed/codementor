import { z } from "zod";

import { LANGUAGES } from "@/lib/constants";

const LANGUAGE_VALUES = LANGUAGES.map((l) => l.value) as [string, ...string[]];

export const emailField = z
  .string()
  .trim()
  .email("Adresse email invalide.")
  .toLowerCase();

export const passwordField = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caracteres.")
  .max(128, "Le mot de passe ne peut pas depasser 128 caracteres.");

export const nameField = z
  .string()
  .trim()
  .min(2, "Le nom doit contenir au moins 2 caracteres.")
  .max(80, "Le nom ne peut pas depasser 80 caracteres.");

export const languageField = z.enum(LANGUAGE_VALUES, {
  message: "Langage non pris en charge.",
});
