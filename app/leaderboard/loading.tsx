export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 h-8 w-64 animate-pulse rounded bg-muted" />

      <div className="mb-6 flex gap-2">
        <div className="h-8 w-28 animate-pulse rounded-full bg-muted" />
        <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border border-border p-4"
          >
            <div className="h-6 w-6 animate-pulse rounded bg-muted" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            <div className="flex-1">
              <div className="mb-1 h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
