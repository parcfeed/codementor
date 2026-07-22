import { NextRequest, NextResponse } from "next/server";

import { reportsQuerySchema } from "@/features/moderation/schemas";
import { ApiError } from "@/lib/errors";
import { moderatorHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";

export const GET = moderatorHandler(async (request: NextRequest) => {
  const url = new URL(request.url);
  const parsed = reportsQuerySchema.safeParse(
    Object.fromEntries(url.searchParams),
  );

  if (!parsed.success) {
    throw ApiError.validation("Parametres de requete invalides.", {
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { page, limit, status } = parsed.data;
  const where = status ? { status } : {};

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      include: {
        reporter: {
          select: { id: true, name: true },
        },
        review: {
          select: {
            id: true,
            rating: true,
            reviewer: {
              select: { id: true, name: true },
            },
            snippet: {
              select: { id: true, language: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.report.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
