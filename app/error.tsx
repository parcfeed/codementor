"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-12">
      <section className="app-card w-full max-w-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-destructive">
            <AlertTriangle aria-hidden="true" className="h-8 w-8" />
          </span>
        </div>

        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Une erreur est survenue
        </h1>

        <p className="mb-6 text-sm leading-6 text-muted-foreground">
          {error.message ||
            "Une erreur inattendue s'est produite. Reessaye ou contacte un administrateur."}
        </p>

        <Button onClick={reset}>Reessayer</Button>
      </section>
    </main>
  );
}
