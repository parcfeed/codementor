import { NextResponse } from "next/server";

import { createReviewSchema } from "@/features/reviews/schemas";
import { authenticatedHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import { checkAndAwardBadges } from "@/lib/badges";
import { prisma } from "@/lib/prisma";

export const POST = authenticatedHandler(
  async (request: Request, { userId }) => {
    const body = await request.json();
    const parsedBody = createReviewSchema.safeParse(body);

    if (!parsedBody.success) {
      throw ApiError.validation("Les donnees transmises sont invalides.", {
        errors: parsedBody.error.flatten().fieldErrors,
      });
    }

    const { snippetId, rating, comments } = parsedBody.data;

    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      select: { id: true, userId: true },
    });

    if (!snippet) {
      throw ApiError.notFound("Snippet introuvable.");
    }

    if (snippet.userId === userId) {
      throw ApiError.forbidden(
        "Vous ne pouvez pas reviewer votre propre snippet.",
      );
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        snippetId,
        reviewerId: userId,
      },
      select: { id: true },
    });

    if (existingReview) {
      throw ApiError.conflict("Vous avez deja reviewed ce snippet.");
    }

    const review = await prisma.review.create({
      data: {
        snippetId,
        reviewerId: userId,
        rating,
        comments: {
          create: comments.map((comment) => ({
            lineNumber: comment.lineNumber,
            content: comment.content,
          })),
        },
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          orderBy: {
            lineNumber: "asc",
          },
        },
      },
    });

    await checkAndAwardBadges(userId);

    return NextResponse.json(
      { success: true, message: "Review creee avec succes.", review },
      { status: 201 },
    );
  },
);
