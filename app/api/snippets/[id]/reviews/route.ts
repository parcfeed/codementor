import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async (request: NextRequest, { params }) => {
  const snippet = await prisma.snippet.findUnique({
    where: { id: params.id },
    select: { id: true },
  });

  if (!snippet) {
    throw ApiError.notFound("Snippet introuvable.");
  }

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)),
  );

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { snippetId: params.id },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        reviewer: {
          select: { id: true, name: true },
        },
        comments: {
          orderBy: { lineNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.count({ where: { snippetId: params.id } }),
  ]);

  return NextResponse.json({
    success: true,
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
