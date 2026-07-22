import { z } from "zod";

export const reportSchema = z.object({
  reason: z
    .string()
    .min(1, "La raison est obligatoire.")
    .max(500, "La raison ne peut pas depasser 500 caracteres."),
});

export const reportsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(["PENDING", "REVIEWED", "DISMISSED"]).optional(),
});

export const CHECKLIST_ITEMS = [
  { id: "readable", label: "Le code est lisible." },
  { id: "variables", label: "Les variables sont bien nommees." },
  { id: "practices", label: "Les bonnes pratiques sont respectees." },
  { id: "constructive", label: "Les commentaires sont constructifs." },
] as const;

export const checklistSchema = z.object({
  checkedItems: z
    .array(z.string())
    .refine(
      (items) => CHECKLIST_ITEMS.every((item) => items.includes(item.id)),
      {
        message:
          "Tous les elements de la checklist doivent etre coches avant de publier.",
      },
    ),
});

export type ReportInput = z.infer<typeof reportSchema>;
