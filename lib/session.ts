import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export function getAuthSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getAuthSession();

  return session?.user ?? null;
}

export async function revalidateModerator(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isModerator: true },
  });

  return user?.isModerator ?? false;
}

export async function requireModerator() {
  const session = await getAuthSession();

  if (!session?.user) {
    return null;
  }

  const isModerator = await revalidateModerator(session.user.id);

  if (!isModerator) {
    return null;
  }

  return session;
}

export async function isCurrentUserModerator(): Promise<boolean> {
  const session = await getAuthSession();

  if (!session?.user) return false;

  return revalidateModerator(session.user.id);
}
