import { Prisma } from "@/generated/prisma/client";

import { prisma as defaultPrisma } from "@/lib/prisma";

type PrismaClientOrTx = Prisma.TransactionClient | typeof defaultPrisma;

export async function updateReviewerReputation(
  client: PrismaClientOrTx,
  reviewerId: string,
  reputationChange: number,
) {
  await client.user.update({
    where: { id: reviewerId },
    data: {
      reputationScore: {
        increment: reputationChange,
      },
    },
  });
}
