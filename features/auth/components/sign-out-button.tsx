"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      aria-label="Se deconnecter de votre compte"
      className="btn-secondary"
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Se deconnecter
    </button>
  );
}
