import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-12">
      <section className="app-card w-full max-w-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-warning">
            <ShieldAlert aria-hidden="true" className="h-8 w-8" />
          </span>
        </div>

        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Acces refuse
        </h1>

        <p className="mb-8 text-sm leading-6 text-muted-foreground">
          Tu n&apos;as pas les permissions necessaires pour acceder a cette
          page.
        </p>

        <Link className="btn-primary" href="/dashboard">
          Revenir au dashboard
        </Link>
      </section>
    </main>
  );
}
