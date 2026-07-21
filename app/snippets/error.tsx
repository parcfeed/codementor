"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function SnippetsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-shell">
      <section className="app-card mx-auto max-w-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-destructive">
            <AlertCircle aria-hidden="true" className="h-7 w-7" />
          </span>
        </div>

        <h2 className="mb-2 text-xl font-semibold text-foreground">
          Impossible de charger les snippets
        </h2>

        <p className="mb-6 text-sm leading-6 text-muted-foreground">
          {error.message ||
            "Une erreur est survenue lors du chargement des snippets."}
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>Reessayer</Button>
          <Link className="btn-secondary" href="/dashboard">
            Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
