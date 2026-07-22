import { NextRequest, NextResponse } from "next/server";

import { moderatorHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export const GET = moderatorHandler(
  async (_request: NextRequest, { params, userId }) => {
    const snippet = await prisma.snippet.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        isAnonymous: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!snippet) throw ApiError.notFound();

    logger.info("Desanonymisation d'un snippet par un moderateur", {
      moderatorId: userId,
      snippetId: params.id,
    });

    return NextResponse.json({
      success: true,
      author: snippet.user,
      wasAnonymous: snippet.isAnonymous,
    });
  },
);
