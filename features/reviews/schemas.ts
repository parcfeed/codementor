import { z } from "zod";

export const lineCommentSchema = z.object({
  lineNumber: z
    .number()
    .int()
    .positive("Le numero de ligne doit etre positif."),
  content: z.string().min(1, "Le commentaire ne peut pas etre vide."),
});

export const createReviewSchema = z.object({
  snippetId: z.string().min(1, "Le snippet est obligatoire."),
  rating: z
    .number()
    .int()
    .min(1, "La note doit etre comprise entre 1 et 5.")
    .max(5, "La note doit etre comprise entre 1 et 5."),
  comments: z.array(lineCommentSchema).default([]),
});

export const voteSchema = z.object({
  value: z
    .number()
    .int()
    .refine((val) => val === 1 || val === -1, {
      message: "La valeur doit etre 1 ou -1.",
    }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type LineComment = z.infer<typeof lineCommentSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
