type ReportCardProps = {
  id: string;
  reason: string;
  status: "PENDING" | "REVIEWED" | "DISMISSED";
  createdAt: Date;
  reporterName: string;
  reviewerName: string;
  onUpdateStatus: (id: string, status: "REVIEWED" | "DISMISSED") => void;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  REVIEWED: "Traite",
  DISMISSED: "Ignore",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:
    "bg-warning-soft text-warning-soft-foreground border border-warning-soft-foreground/20",
  REVIEWED:
    "bg-success-soft text-success-soft-foreground border border-success-soft-foreground/20",
  DISMISSED: "bg-muted text-muted-foreground border border-border",
};

export function ReportCard({
  id,
  reason,
  status,
  createdAt,
  reporterName,
  reviewerName,
  onUpdateStatus,
}: ReportCardProps) {
  return (
    <article className="app-card">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{reason}</p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Signale par {reporterName}</span>
            <span aria-hidden="true">&middot;</span>
            <span>Review de {reviewerName}</span>
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

        <span
          className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      {status === "PENDING" ? (
        <div className="flex gap-2">
          <button
            aria-label="Marquer le signalement comme traite"
            className="btn-primary h-9 text-xs"
            type="button"
            onClick={() => onUpdateStatus(id, "REVIEWED")}
          >
            Marquer comme traite
          </button>

          <button
            aria-label="Ignorer le signalement"
            className="btn-ghost h-9 text-xs"
            type="button"
            onClick={() => onUpdateStatus(id, "DISMISSED")}
          >
            Ignorer
          </button>
        </div>
      ) : null}
    </article>
  );
}
