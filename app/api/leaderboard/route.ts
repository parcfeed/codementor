import { NextRequest, NextResponse } from "next/server";

import { authenticatedHandler } from "@/lib/api-handler";
import { PAGINATION } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const GET = authenticatedHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = Math.max(
    PAGINATION.DEFAULT_PAGE,
    Number(searchParams.get("page")) || PAGINATION.DEFAULT_PAGE,
  );
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, Number(searchParams.get("limit")) || 10),
  );
  const skip = (page - 1) * limit;

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        reputationScore: true,
        _count: {
          select: {
            reviews: true,
            snippets: true,
          },
        },
        badges: {
          select: {
            badge: {
              select: {
                name: true,
                icon: true,
              },
            },
          },
        },
      },
      orderBy: {
        reputationScore: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return NextResponse.json({
    success: true,
    users: users.map((user, index) => ({
      id: user.id,
      name: user.name,
      reputationScore: user.reputationScore,
      reviewCount: user._count.reviews,
      snippetCount: user._count.snippets,
      badges: user.badges.map((ub) => ({
        name: ub.badge.name,
        icon: ub.badge.icon,
      })),
      position: skip + index + 1,
    })),
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
