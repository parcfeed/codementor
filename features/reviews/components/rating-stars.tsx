"use client";

import { Star } from "lucide-react";

type RatingStarsProps = {
  rating: number;
  size?: "sm" | "md";
};

export function RatingStars({ rating, size = "sm" }: RatingStarsProps) {
  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating ? "text-amber-400" : "text-muted-foreground/30"
          }`}
          fill={star <= rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}
