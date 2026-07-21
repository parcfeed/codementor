export default function RootLoading() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-12">
      <div className="app-card flex w-full max-w-md flex-col gap-4 p-6">
        <div className="skeleton h-5 w-36" />
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-24 w-full" />
        <p className="sr-only">Chargement...</p>
      </div>
    </main>
  );
}
