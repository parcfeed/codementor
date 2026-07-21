export default function SnippetDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 h-8 w-2/3 animate-pulse rounded bg-muted" />

      <div className="mb-8 flex flex-wrap gap-2">
        <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
        <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="mb-8 overflow-hidden rounded-lg border border-border">
        <div className="h-80 animate-pulse bg-slate-100" />
      </div>

      <div className="mb-4 h-6 w-32 animate-pulse rounded bg-muted" />

      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="mb-4 rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
