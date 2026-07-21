"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { ChecklistReview } from "@/features/moderation/components/checklist-review";
import { CHECKLIST_ITEMS } from "@/features/moderation/schemas";
import { RatingInput } from "@/features/reviews/components/rating-input";
import { createReviewSchema } from "@/features/reviews/schemas";

type ReviewFormProps = {
  snippetId: string;
};

type FieldErrors = {
  rating?: string;
  comments?: string;
};

type CommentEntry = {
  lineNumber: string;
  content: string;
};

export function ReviewForm({ snippetId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState<CommentEntry[]>([
    { lineNumber: "", content: "" },
  ]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleChecklistItem(id: string) {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function addComment() {
    setComments([...comments, { lineNumber: "", content: "" }]);
  }

  function removeComment(index: number) {
    setComments(comments.filter((_, i) => i !== index));
  }

  function updateComment(
    index: number,
    field: keyof CommentEntry,
    value: string,
  ) {
    const updated = comments.map((comment, i) =>
      i === index ? { ...comment, [field]: value } : comment,
    );

    setComments(updated);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const parsedComments = comments
      .filter((c) => c.lineNumber !== "" || c.content !== "")
      .map((c) => ({
        lineNumber: Number(c.lineNumber),
        content: c.content,
      }));

    const parsedValues = createReviewSchema.safeParse({
      snippetId,
      rating,
      comments: parsedComments,
    });

    if (!parsedValues.success) {
      const fieldErrors = parsedValues.error.flatten().fieldErrors;

      setErrors({
        rating: fieldErrors.rating?.[0],
        comments: fieldErrors.comments?.[0],
      });

      return;
    }

    const allChecked = CHECKLIST_ITEMS.every((item) =>
      checkedItems.includes(item.id),
    );

    if (!allChecked) {
      setFormError(
        "Tu dois cocher tous les criteres de qualite avant de publier.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedValues.data),
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.message ?? "Une erreur est survenue.");

        return;
      }

      setRating(0);
      setComments([{ lineNumber: "", content: "" }]);
      router.refresh();
    } catch {
      setFormError("Une erreur est survenue lors de l'envoi de la review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <div className="flex flex-col gap-2">
        <label className="field-label">Note globale</label>
        <RatingInput value={rating} onChange={setRating} />
        {errors.rating ? <p className="field-error">{errors.rating}</p> : null}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="field-label">Commentaires ligne par ligne</p>

          <button
            aria-label="Ajouter un commentaire ligne par ligne"
            className="text-sm font-medium text-foreground underline transition hover:text-muted-foreground"
            type="button"
            onClick={addComment}
          >
            + Ajouter un commentaire
          </button>
        </div>

        {comments.map((comment, index) => (
          <div
            key={index}
            className="flex items-start gap-2 rounded-md border border-border bg-card p-3"
          >
            <div className="w-20 shrink-0">
              <label
                className="mb-1 block text-xs font-medium text-muted-foreground"
                htmlFor={`line-${index}`}
              >
                Ligne
              </label>
              <input
                className="h-9 w-full rounded-md border border-input bg-card px-2 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                id={`line-${index}`}
                type="number"
                min="1"
                placeholder="1"
                value={comment.lineNumber}
                onChange={(event) =>
                  updateComment(index, "lineNumber", event.target.value)
                }
              />
            </div>

            <div className="flex-1">
              <label
                className="mb-1 block text-xs font-medium text-muted-foreground"
                htmlFor={`content-${index}`}
              >
                Commentaire
              </label>
              <textarea
                className="h-9 w-full resize-none rounded-md border border-input bg-card px-2 py-1.5 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                id={`content-${index}`}
                rows={1}
                placeholder="Ecris ton commentaire..."
                value={comment.content}
                onChange={(event) =>
                  updateComment(index, "content", event.target.value)
                }
              />
            </div>

            {comments.length > 1 ? (
              <button
                aria-label="Supprimer ce commentaire"
                className="mt-5 shrink-0 text-sm text-destructive hover:opacity-80"
                type="button"
                onClick={() => removeComment(index)}
              >
                Supprimer
              </button>
            ) : null}
          </div>
        ))}

        {errors.comments ? (
          <p className="field-error">{errors.comments}</p>
        ) : null}
      </div>

      <ChecklistReview
        checkedItems={checkedItems}
        onToggle={toggleChecklistItem}
      />

      {formError ? <p className="alert-error">{formError}</p> : null}

      <button
        aria-label="Soumettre la review"
        className="btn-primary h-11"
        type="submit"
        disabled={isSubmitting || rating === 0}
      >
        {isSubmitting ? "Envoi..." : "Soumettre la review"}
      </button>
    </form>
  );
}
