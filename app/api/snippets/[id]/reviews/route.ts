import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async (_request: NextRequest, { params }) => {
  const snippet = await prisma.snippet.findUnique({
    where: { id: params.id },
    select: { id: true },
  });

  if (!snippet) {
    throw ApiError.notFound("Snippet introuvable.");
  }

  const reviews = await prisma.review.findMany({
    where: { snippetId: params.id },
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ success: true, reviews });
});
