import Link from "next/link";
import { MessageSquare } from "lucide-react";

type SnippetCardProps = {
  id: string;
  language: string;
  authorName: string | null;
  isAnonymous: boolean;
  createdAt: Date;
  reviewCount: number;
};

export function SnippetCard({
  id,
  language,
  authorName,
  isAnonymous,
  createdAt,
  reviewCount,
}: SnippetCardProps) {
  const displayAuthor = isAnonymous ? "Anonyme" : (authorName ?? "Inconnu");

  return (
    <Link
      aria-label={`Voir le snippet ${language} par ${displayAuthor}`}
      className="app-card app-card-hover group block"
      href={`/snippets/${id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
            {language}
          </span>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{displayAuthor}</span>
            <span aria-hidden="true">&middot;</span>
            <time dateTime={createdAt.toISOString()}>
              {createdAt.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>{reviewCount}</span>
        </div>
      </div>
    </Link>
  );
}
