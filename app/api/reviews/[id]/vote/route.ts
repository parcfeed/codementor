import { NextRequest, NextResponse } from "next/server";

import { voteSchema } from "@/features/reviews/schemas";
import { authenticatedHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import { checkAndAwardBadges } from "@/lib/badges";
import { prisma } from "@/lib/prisma";
import { updateReviewerReputation } from "@/lib/reputation";

export const POST = authenticatedHandler(
  async (request: NextRequest, { userId, params }) => {
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

    const existingVote = await prisma.vote.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
    });

    let newUserVote: number | null;
    let scoreDelta: number;

    if (!existingVote) {
      await prisma.vote.create({
        data: {
          reviewId,
          userId,
          value,
        },
      });

      newUserVote = value;
      scoreDelta = value;
    } else if (existingVote.value === value) {
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });

      newUserVote = null;
      scoreDelta = -value;
    } else {
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { value },
      });

      newUserVote = value;
      scoreDelta = value - existingVote.value;
    }

    await updateReviewerReputation(review.reviewerId, scoreDelta);

    await Promise.all([
      checkAndAwardBadges(review.reviewerId),
      checkAndAwardBadges(userId),
    ]);

    const voteScore = await prisma.vote.aggregate({
      _sum: { value: true },
      where: { reviewId },
    });

    const score = voteScore._sum?.value ?? 0;

    return NextResponse.json({
      success: true,
      score,
      userVote: newUserVote,
    });
  },
);
