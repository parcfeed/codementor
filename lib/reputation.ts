import { prisma } from "@/lib/prisma";

export async function updateReviewerReputation(
  reviewerId: string,
  reputationChange: number,
) {
  await prisma.user.update({
    where: { id: reviewerId },
    data: {
      reputationScore: {
        increment: reputationChange,
      },
    },
  });
}
