"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { CodeEditor } from "@/features/snippets/components/code-editor";
import { LANGUAGES } from "@/features/snippets/constants";
import { createSnippetSchema } from "@/features/snippets/schemas";

type FieldErrors = {
  code?: string;
  language?: string;
};

export function CreateSnippetForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const parsedValues = createSnippetSchema.safeParse({
      code,
      language,
      isAnonymous,
    });

    if (!parsedValues.success) {
      const fieldErrors = parsedValues.error.flatten().fieldErrors;

      setErrors({
        code: fieldErrors.code?.[0],
        language: fieldErrors.language?.[0],
      });

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedValues.data),
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.message ?? "Une erreur est survenue.");

        return;
      }

      router.push(`/snippets/${result.snippet.id}`);
      router.refresh();
    } catch {
      setFormError("Une erreur est survenue lors de la creation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="flex flex-col gap-2">
        <label className="field-label" htmlFor="language">
          Langage
        </label>
        <select
          className="field-control"
          id="language"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        >
          <option value="">Selectionne un langage</option>
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        {errors.language ? (
          <p className="field-error">{errors.language}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className="field-label" htmlFor="code">
          Code
        </label>
        <CodeEditor
          language={language || "plaintext"}
          value={code}
          onChange={setCode}
        />
        {errors.code ? <p className="field-error">{errors.code}</p> : null}
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
          type="checkbox"
          checked={isAnonymous}
          onChange={(event) => setIsAnonymous(event.target.checked)}
        />
        <span className="text-sm text-secondary-foreground">
          Soumettre de maniere anonyme
        </span>
      </label>

      {formError ? <p className="alert-error">{formError}</p> : null}

      <button
        aria-label="Creer le snippet"
        className="btn-primary h-11"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creation..." : "Creer le snippet"}
      </button>
    </form>
  );
}
