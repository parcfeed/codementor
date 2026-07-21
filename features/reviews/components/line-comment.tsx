type LineCommentProps = {
  lineNumber: number;
  content: string;
  createdAt: Date;
};

export function LineComment({
  lineNumber,
  content,
  createdAt,
}: LineCommentProps) {
  return (
    <div className="flex gap-3 rounded-md border border-border bg-muted p-3">
      <span className="flex h-6 w-8 shrink-0 items-center justify-center rounded bg-muted-foreground/20 text-xs font-medium text-muted-foreground">
        {lineNumber}
      </span>

      <div className="flex flex-col gap-1">
        <p className="text-sm leading-6 text-foreground">{content}</p>
        <time
          className="text-xs text-muted-foreground"
          dateTime={createdAt.toISOString()}
        >
          {createdAt.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
    </div>
  );
}
