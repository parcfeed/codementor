"use client";

import { CHECKLIST_ITEMS } from "@/features/moderation/schemas";

type ChecklistReviewProps = {
  checkedItems: string[];
  onToggle: (id: string) => void;
};

export function ChecklistReview({
  checkedItems,
  onToggle,
}: ChecklistReviewProps) {
  const allChecked = CHECKLIST_ITEMS.every((item) =>
    checkedItems.includes(item.id),
  );

  return (
    <div className="rounded-md border border-border bg-muted p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
        Checklist qualite
      </p>

      <div className="flex flex-col gap-2">
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = checkedItems.includes(item.id);

          return (
            <label
              key={item.id}
              className={`flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
                isChecked
                  ? "bg-card text-success"
                  : "text-secondary-foreground hover:bg-card"
              }`}
            >
              <input
                className="h-4 w-4 rounded border-input text-success focus:ring-ring"
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(item.id)}
              />
              {item.label}
            </label>
          );
        })}
      </div>

      {allChecked ? (
        <p className="mt-3 text-xs text-success">
          Tous les criteres sont valides.
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Coche tous les criteres pour valider ta review.
        </p>
      )}
    </div>
  );
}
