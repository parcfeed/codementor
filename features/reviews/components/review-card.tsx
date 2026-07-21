import { LineComment } from "@/features/reviews/components/line-comment";
import { RatingStars } from "@/features/reviews/components/rating-stars";
import { VoteButtons } from "@/features/reviews/components/vote-buttons";
import { ReportButton } from "@/features/moderation/components/report-button";

type ReviewCardProps = {
  reviewId: string;
  reviewerName: string;
  rating: number;
  createdAt: Date;
  comments: {
    id: string;
    lineNumber: number;
    content: string;
    createdAt: Date;
  }[];
  score: number;
  userVote: number | null;
  isOwnReview: boolean;
};

export function ReviewCard({
  reviewId,
  reviewerName,
  rating,
  createdAt,
  comments,
  score,
  userVote,
  isOwnReview,
}: ReviewCardProps) {
  return (
    <article className="app-card">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {reviewerName.charAt(0).toUpperCase()}
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {reviewerName}
            </span>
            <time
              className="text-xs text-muted-foreground"
              dateTime={createdAt.toISOString()}
            >
              {createdAt.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <RatingStars rating={rating} />

          <VoteButtons
            reviewId={reviewId}
            initialScore={score}
            initialUserVote={userVote}
            isOwnReview={isOwnReview}
          />
        </div>
      </div>

      {comments.length > 0 ? (
        <div className="flex flex-col gap-2">
          {comments.map((comment) => (
            <LineComment
              key={comment.id}
              lineNumber={comment.lineNumber}
              content={comment.content}
              createdAt={comment.createdAt}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border bg-muted px-3 py-4 text-sm italic text-muted-foreground">
          Aucun commentaire ligne par ligne.
        </p>
      )}

      {!isOwnReview ? (
        <div className="mt-3 flex justify-end">
          <ReportButton reviewId={reviewId} />
        </div>
      ) : null}
    </article>
  );
}
