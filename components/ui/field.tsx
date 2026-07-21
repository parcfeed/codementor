import { useId, type ReactNode } from "react";

import { cn } from "@/utils/cn";

type FieldProps = {
  label: string;
  /** id optionnel ; un id auto-généré est utilisé sinon. */
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  /** Contenu du champ (input, select, textarea...). Reçoit `id` et `aria-describedby`. */
  children: (props: {
    id: string;
    describedBy?: string;
    className: string;
  }) => ReactNode;
  className?: string;
};

/**
 * Wrapper de champ de formulaire : label + control + message d'erreur/lié à
 * l'a11i. Supprime la duplication du pattern `<label>` + `<input>` +
 * `<p className="field-error">` présent dans tous les formulaires de l'app.
 *
 * Le rendu du contrôle est délégué via render-prop pour rester flexible
 * (input, select, textarea, Monaco, RatingInput...).
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: FieldProps) {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  const hasError = Boolean(error);
  const describedBy = hasError ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {children({
        id,
        describedBy,
        className: cn(
          "field-control",
          hasError &&
            "border-destructive focus:border-destructive focus:ring-destructive",
        ),
      })}
      {hasError ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
