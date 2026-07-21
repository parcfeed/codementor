import { NextRequest, NextResponse } from "next/server";

import { voteSchema } from "@/features/reviews/schemas";
import { authenticatedHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import { checkAndAwardBadges } from "@/lib/badges";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { updateReviewerReputation } from "@/lib/reputation";

export const POST = authenticatedHandler(
  async (request: NextRequest, { userId, params }) => {
    checkRateLimit(`vote:${userId}`);
    const body = await request.json();
    const parsedBody = voteSchema.safeParse(body);

    if (!parsedBody.success) {
      throw ApiError.validation("Les donnees transmises sont invalides.", {
        errors: parsedBody.error.flatten().fieldErrors,
      });
    }

    const { value } = parsedBody.data;
    const reviewId = params.id;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, reviewerId: true },
    });

    if (!review) {
      throw ApiError.notFound("Review introuvable.");
    }

    if (review.reviewerId === userId) {
      throw ApiError.forbidden(
        "Vous ne pouvez pas voter pour votre propre review.",
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingVote = await tx.vote.findUnique({
        where: {
          reviewId_userId: { reviewId, userId },
        },
      });

      let newUserVote: number | null;
      let scoreDelta: number;

      if (!existingVote) {
        await tx.vote.create({ data: { reviewId, userId, value } });
        newUserVote = value;
        scoreDelta = value;
      } else if (existingVote.value === value) {
        await tx.vote.delete({ where: { id: existingVote.id } });
        newUserVote = null;
        scoreDelta = -value;
      } else {
        await tx.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });
        newUserVote = value;
        scoreDelta = value - existingVote.value;
      }

      await updateReviewerReputation(tx, review.reviewerId, scoreDelta);

      const voteScore = await tx.vote.aggregate({
        _sum: { value: true },
        where: { reviewId },
      });

      const score = voteScore._sum?.value ?? 0;

      return { score, newUserVote };
    });

    Promise.all([
      checkAndAwardBadges(review.reviewerId).catch((err) => {
        logger.error("Erreur attribution badges reviewer", {
          error: String(err),
          reviewerId: review.reviewerId,
        });
      }),
      checkAndAwardBadges(userId).catch((err) => {
        logger.error("Erreur attribution badges votant", {
          error: String(err),
          userId,
        });
      }),
    ]);

    return NextResponse.json({
      success: true,
      score: result.score,
      userVote: result.newUserVote,
    });
  },
);
