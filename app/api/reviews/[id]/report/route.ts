import { NextRequest, NextResponse } from "next/server";

import { reportSchema } from "@/features/moderation/schemas";
import { authenticatedHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const POST = authenticatedHandler(
  async (request: NextRequest, { userId, params }) => {
    const body = await request.json();
    const parsedBody = reportSchema.safeParse(body);

    if (!parsedBody.success) {
      throw ApiError.validation("Les donnees transmises sont invalides.", {
        errors: parsedBody.error.flatten().fieldErrors,
      });
    }

    const { reason } = parsedBody.data;
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
        "Vous ne pouvez pas signaler votre propre review.",
      );
    }

    const existingReport = await prisma.report.findUnique({
      where: {
        reviewId_reporterId: {
          reviewId,
          reporterId: userId,
        },
      },
      select: { id: true },
    });

    if (existingReport) {
      throw ApiError.conflict("Vous avez deja signale cette review.");
    }

    await prisma.report.create({
      data: {
        reviewId,
        reporterId: userId,
        reason,
      },
    });

    return NextResponse.json(
      { success: true, message: "Review signalee avec succes." },
      { status: 201 },
    );
  },
);
