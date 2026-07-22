"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Modal } from "@/components/ui/modal";
import { extractErrorMessage } from "@/lib/api-client";
import { reportSchema } from "@/features/moderation/schemas";

type ReportDialogProps = {
  reviewId: string;
  onClose: () => void;
};

export function ReportDialog({ reviewId, onClose }: ReportDialogProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = reportSchema.safeParse({ reason });

    if (!parsed.success) {
      setError(
        parsed.error.flatten().fieldErrors.reason?.[0] ?? "Raison invalide.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(extractErrorMessage(result, "Une erreur est survenue."));

        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Une erreur est survenue lors du signalement.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <Modal
        title="Signalement envoye"
        description="Merci de contribuer a la qualite des reviews sur CodeMentor."
        onClose={onClose}
      >
        <p className="alert-success mb-5">
          Le signalement a bien ete transmis a la moderation.
        </p>
        <div className="flex justify-end">
          <button className="btn-primary" type="button" onClick={onClose}>
            Fermer
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Signaler cette review"
      description="Explique pourquoi cette review n'est pas constructive ou ne respecte pas les consignes."
      onClose={onClose}
    >
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2">
          <label className="field-label" htmlFor={`report-reason-${reviewId}`}>
            Raison du signalement
          </label>
          <textarea
            aria-describedby={error ? `report-error-${reviewId}` : undefined}
            className="field-control min-h-32 resize-y"
            id={`report-reason-${reviewId}`}
            placeholder="Explique la raison du signalement..."
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>

        {error ? (
          <p className="alert-error" id={`report-error-${reviewId}`}>
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            aria-label="Annuler le signalement"
            className="btn-secondary"
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Annuler
          </button>

          <button
            aria-label="Envoyer le signalement"
            className="btn-danger"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Envoi..." : "Signaler"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
