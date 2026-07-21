"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Modal } from "@/components/ui/modal";

type DeleteSnippetButtonProps = {
  snippetId: string;
};

export function DeleteSnippetButton({ snippetId }: DeleteSnippetButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/snippets/${snippetId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Une erreur est survenue.");

        return;
      }

      router.push("/snippets");
      router.refresh();
    } catch {
      setError("Une erreur est survenue lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        aria-label="Supprimer ce snippet"
        className="btn-danger h-9"
        type="button"
        onClick={() => setShowConfirm(true)}
      >
        Supprimer
      </button>

      {showConfirm ? (
        <Modal
          title="Supprimer ce snippet"
          description="Cette action est irreversible. Le snippet et ses reviews associees seront supprimes."
          onClose={() => {
            if (!isDeleting) {
              setShowConfirm(false);
              setError(null);
            }
          }}
        >
          {error ? <p className="alert-error mb-4">{error}</p> : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              aria-label="Annuler la suppression"
              className="btn-secondary"
              type="button"
              disabled={isDeleting}
              onClick={() => {
                setShowConfirm(false);
                setError(null);
              }}
            >
              Annuler
            </button>

            <button
              aria-label="Confirmer la suppression du snippet"
              className="btn-danger"
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
