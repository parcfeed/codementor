import { Prisma } from "@/generated/prisma/client";

import { prisma as defaultPrisma } from "@/lib/prisma";

// Systeme intentionnellement simple : le delta correspond a la valeur brute du vote (+1/-1).
// Aucun bareme asymetrique n'est applique. Voir lib/constants.ts pour la justification.
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
