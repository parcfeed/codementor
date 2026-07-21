import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export function getAuthSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getAuthSession();

  return session?.user ?? null;
}

export async function requireModerator() {
  const session = await getAuthSession();

  if (!session?.user || !session.user.isModerator) {
    return null;
  }

  return session;
}
