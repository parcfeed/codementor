import { NextRequest, NextResponse } from "next/server";

import { createSnippetSchema } from "@/features/snippets/schemas";
import { apiHandler, authenticatedHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import { PAGINATION } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const POST = authenticatedHandler(
  async (request: NextRequest, { userId }) => {
    const body = await request.json();
    const parsedBody = createSnippetSchema.safeParse(body);

    if (!parsedBody.success) {
      throw ApiError.validation("Les donnees transmises sont invalides.", {
        errors: parsedBody.error.flatten().fieldErrors,
      });
    }

    const { code, language, isAnonymous } = parsedBody.data;

    const snippet = await prisma.snippet.create({
      data: {
        code,
        language,
        isAnonymous,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Snippet cree avec succes.", snippet },
      { status: 201 },
    );
  },
);

export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = Math.max(
    PAGINATION.DEFAULT_PAGE,
    Number(searchParams.get("page")) || PAGINATION.DEFAULT_PAGE,
  );
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, Number(searchParams.get("limit")) || 10),
  );
  const language = searchParams.get("language");
  const skip = (page - 1) * limit;

  const where = language ? { language } : {};

  const [snippets, totalCount] = await Promise.all([
    prisma.snippet.findMany({
      where,
      select: {
        id: true,
        language: true,
        isAnonymous: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.snippet.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return NextResponse.json({
    success: true,
    snippets,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
});
