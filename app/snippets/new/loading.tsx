export default function NewSnippetLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-muted" />

      <div className="space-y-5">
        <div>
          <div className="mb-1 h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        </div>

        <div>
          <div className="mb-1 h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        </div>

        <div>
          <div className="mb-1 h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-64 w-full animate-pulse rounded-md bg-muted" />
        </div>

        <div className="h-11 w-28 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}
