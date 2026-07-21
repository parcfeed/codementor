import { z } from "zod";

import { languageField } from "@/lib/validation";

const codeField = z
  .string()
  .min(1, "Le code est obligatoire.")
  .max(50000, "Le code ne peut pas depasser 50 000 caracteres.");

const difficultyField = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], {
  message: "La difficulte doit etre BEGINNER, INTERMEDIATE ou ADVANCED.",
});

export const createSnippetSchema = z.object({
  code: codeField,
  language: languageField,
  difficulty: difficultyField.optional().default("INTERMEDIATE"),
  isAnonymous: z.boolean().optional().default(false),
});

export const updateSnippetSchema = z.object({
  code: codeField,
  language: languageField,
  difficulty: difficultyField.optional(),
  isAnonymous: z.boolean().optional(),
});

export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetInput = z.infer<typeof updateSnippetSchema>;
