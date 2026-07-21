"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

type VoteButtonsProps = {
  reviewId: string;
  initialScore: number;
  initialUserVote: number | null;
  isOwnReview: boolean;
};

export function VoteButtons({
  reviewId,
  initialScore,
  initialUserVote,
  isOwnReview,
}: VoteButtonsProps) {
  const router = useRouter();
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleVote(value: number) {
    if (isSubmitting || isOwnReview) {
      return;
    }

    setIsSubmitting(true);

    const previousVote = userVote;
    const previousScore = score;

    const newUserVote = userVote === value ? null : value;
    const scoreDelta = (newUserVote ?? 0) - (previousVote ?? 0);

    setScore(score + scoreDelta);
    setUserVote(newUserVote);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      const result = await response.json();

      if (!response.ok) {
        setScore(previousScore);
        setUserVote(previousVote);

        return;
      }

      setScore(result.score);
      setUserVote(result.userVote);
      router.refresh();
    } catch {
      setScore(previousScore);
      setUserVote(previousVote);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="Vote positif"
        className={`flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-medium transition ${
          userVote === 1
            ? "border-success bg-success-soft text-success-soft-foreground"
            : "border-border text-muted-foreground hover:bg-accent"
        } ${isOwnReview ? "cursor-not-allowed opacity-50" : ""}`}
        type="button"
        disabled={isSubmitting || isOwnReview}
        onClick={() => handleVote(1)}
      >
        <ThumbsUp aria-hidden="true" className="h-3.5 w-3.5" />
        <span>{score}</span>
      </button>

      <button
        aria-label="Vote negatif"
        className={`flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-medium transition ${
          userVote === -1
            ? "border-destructive bg-destructive/10 text-destructive"
            : "border-border text-muted-foreground hover:bg-accent"
        } ${isOwnReview ? "cursor-not-allowed opacity-50" : ""}`}
        type="button"
        disabled={isSubmitting || isOwnReview}
        onClick={() => handleVote(-1)}
      >
        <ThumbsDown aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
