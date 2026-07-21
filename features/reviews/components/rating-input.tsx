"use client";

import { Star } from "lucide-react";

type RatingInputProps = {
  value: number;
  onChange: (value: number) => void;
};

export function RatingInput({ value, onChange }: RatingInputProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          aria-label={`Noter ${star} etoile${star > 1 ? "s" : ""}`}
          key={star}
          className={`transition ${
            star <= value
              ? "text-amber-400 hover:text-amber-300"
              : "text-muted-foreground/30 hover:text-amber-200"
          }`}
          type="button"
          onClick={() => onChange(star)}
        >
          <Star
            aria-hidden="true"
            className="h-6 w-6"
            fill={star <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}
