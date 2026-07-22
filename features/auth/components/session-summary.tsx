"use client";

import { useSession } from "next-auth/react";

import { SignOutButton } from "@/features/auth/components/sign-out-button";

export function SessionSummary() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <p className="text-sm text-muted-foreground">
        Chargement de la session...
      </p>
    );
  }

  if (!session?.user) {
    return (
      <p className="text-sm text-muted-foreground">Session indisponible.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Utilisateur</dt>
          <dd className="font-medium text-foreground">{session.user.name}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="truncate font-medium text-foreground">
            {session.user.email}
          </dd>
        </div>
      </dl>
      <SignOutButton variant="ghost" />
    </div>
  );
}
