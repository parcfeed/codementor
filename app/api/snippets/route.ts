import { NextRequest, NextResponse } from "next/server";

import { createSnippetSchema } from "@/features/snippets/schemas";
import { DIFFICULTIES, PAGINATION, SORT_OPTIONS } from "@/lib/constants";
import { apiHandler, authenticatedHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
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

    const { code, language, difficulty, isAnonymous } = parsedBody.data;

    const snippet = await prisma.snippet.create({
      data: {
        code,
        language,
        difficulty,
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
  const difficulty = searchParams.get("difficulty");
  const sort = searchParams.get("sort");
  const skip = (page - 1) * limit;

  const isValidDifficulty = (
    v: string | null,
  ): v is (typeof DIFFICULTIES)[number] =>
    v !== null && (DIFFICULTIES as readonly string[]).includes(v);

  const isValidSort = (v: string | null): v is (typeof SORT_OPTIONS)[number] =>
    v !== null && (SORT_OPTIONS as readonly string[]).includes(v);

  const where = {
    ...(language ? { language } : {}),
    ...(isValidDifficulty(difficulty) ? { difficulty } : {}),
  };

  const orderBy: { createdAt: "desc" } | { reviews: { _count: "desc" } } =
    isValidSort(sort)
      ? sort === "popular" || sort === "votes"
        ? { reviews: { _count: "desc" as const } }
        : { createdAt: "desc" }
      : { createdAt: "desc" };

  const [rawSnippets, totalCount] = await Promise.all([
    prisma.snippet.findMany({
      where,
      select: {
        id: true,
        difficulty: true,
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
      orderBy,
      skip,
      take: limit,
    }),
    prisma.snippet.count({ where }),
  ]);

  const snippets = rawSnippets.map((s) => ({
    ...s,
    user: s.isAnonymous ? null : s.user,
  }));

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
