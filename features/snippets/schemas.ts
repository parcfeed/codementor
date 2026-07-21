import { z } from "zod";

import { languageField } from "@/lib/validation";

export const createSnippetSchema = z.object({
  code: z.string().min(1, "Le code est obligatoire."),
  language: languageField,
  isAnonymous: z.boolean().optional().default(false),
});

export const updateSnippetSchema = z.object({
  code: z.string().min(1, "Le code est obligatoire."),
  language: languageField,
  isAnonymous: z.boolean().optional(),
});

export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetInput = z.infer<typeof updateSnippetSchema>;
