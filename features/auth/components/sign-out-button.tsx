"use client";

import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  variant?: "secondary" | "ghost";
};

export function SignOutButton({ variant = "secondary" }: SignOutButtonProps) {
  const className = variant === "ghost" ? "btn-ghost text-xs h-8 px-2" : "btn-secondary";

  return (
    <button
      aria-label="Se deconnecter de votre compte"
      className={className}
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Se deconnecter
    </button>
  );
}
