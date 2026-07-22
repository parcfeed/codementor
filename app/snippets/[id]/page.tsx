import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { ReviewForm } from "@/features/reviews/components/review-form";
import { CodeEditor } from "@/features/snippets/components/code-editor";
import { DeleteSnippetButton } from "@/features/snippets/components/delete-snippet-button";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";

type SnippetDetailPageProps = {
  params: { id: string };
};

export default async function SnippetDetailPage({
  params,
}: SnippetDetailPageProps) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  const snippet = await prisma.snippet.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      reviews: {
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
            },
          },
          comments: {
            orderBy: {
              lineNumber: "asc",
            },
          },
          votes: {
            select: {
              value: true,
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  if (!snippet) {
    notFound();
  }

  const displayAuthor = snippet.isAnonymous
    ? "Anonyme"
    : (snippet.user.name ?? "Inconnu");
  const isOwner = snippet.user.id === session.user.id;
  const hasReviewed = snippet.reviews.some(
    (review) => review.reviewer.id === session.user.id,
  );
  const canReview = !isOwner && !hasReviewed;

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-4xl">
        <div className="page-header">
          <div className="flex flex-col gap-2">
            <p className="eyebrow">CodeMentor</p>
            <h1 className="page-title">{snippet.language}</h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                {snippet.language}
              </span>
              <span aria-hidden="true">&middot;</span>
              <span>{displayAuthor}</span>
              <span aria-hidden="true">&middot;</span>
              <time dateTime={snippet.createdAt.toISOString()}>
                {snippet.createdAt.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              <span aria-hidden="true">&middot;</span>
              <span>
                {snippet._count.reviews} review
                {snippet._count.reviews > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {isOwner ? (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                className="btn-secondary h-9"
                href={`/snippets/${snippet.id}/edit`}
              >
                Modifier
              </Link>
              <DeleteSnippetButton snippetId={snippet.id} />
            </div>
          ) : null}
        </div>

        <div className="app-card p-1">
          <CodeEditor
            language={snippet.language}
            value={snippet.code}
            height="500px"
            readOnly
          />
        </div>

        <div className="mt-10">
          <h2 className="mb-6 text-2xl font-semibold text-foreground">
            Reviews
            {snippet._count.reviews > 0 ? ` (${snippet._count.reviews})` : ""}
          </h2>

          {snippet.reviews.length > 0 ? (
            <div className="flex flex-col gap-4">
              {snippet.reviews.map((review) => {
                const score = review.votes.reduce((sum, v) => sum + v.value, 0);
                const userVote =
                  review.votes.find((v) => v.userId === session.user.id)
                    ?.value ?? null;

                return (
                  <ReviewCard
                    key={review.id}
                    reviewId={review.id}
                    reviewerName={review.reviewer.name ?? "Inconnu"}
                    rating={review.rating}
                    createdAt={review.createdAt}
                    comments={review.comments}
                    score={score}
                    userVote={userVote}
                    isOwnReview={review.reviewer.id === session.user.id}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Aucune review pour le moment"
              description="La premiere review apparaitra ici des qu'un pair aura analyse ce snippet."
            />
          )}

          {canReview ? (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Ajouter une review
              </h3>

              <div className="app-card">
                <ReviewForm snippetId={snippet.id} />
              </div>
            </div>
          ) : null}

          {hasReviewed && !isOwner ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Tu as deja reviewed ce snippet.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
