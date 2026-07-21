import { NextRequest, NextResponse } from "next/server";

import { updateSnippetSchema } from "@/features/snippets/schemas";
import { apiHandler, authenticatedHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async (_request: NextRequest, { params }) => {
  const snippet = await prisma.snippet.findUnique({
    where: { id: params.id },
    include: {
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
  });

  if (!snippet) {
    throw ApiError.notFound("Snippet introuvable.");
  }

  return NextResponse.json({ success: true, snippet });
});

export const PATCH = authenticatedHandler(
  async (request: NextRequest, { userId, params }) => {
    const snippet = await prisma.snippet.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!snippet) {
      throw ApiError.notFound("Snippet introuvable.");
    }

    if (snippet.userId !== userId) {
      throw ApiError.forbidden("Vous n'etes pas l'auteur de ce snippet.");
    }

    const body = await request.json();
    const parsedBody = updateSnippetSchema.safeParse(body);

    if (!parsedBody.success) {
      throw ApiError.validation("Les donnees transmises sont invalides.", {
        errors: parsedBody.error.flatten().fieldErrors,
      });
    }

    const { code, language, isAnonymous } = parsedBody.data;

    const updatedSnippet = await prisma.snippet.update({
      where: { id: params.id },
      data: {
        code,
        language,
        isAnonymous,
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

    return NextResponse.json({
      success: true,
      message: "Snippet modifie avec succes.",
      snippet: updatedSnippet,
    });
  },
);

export const DELETE = authenticatedHandler(
  async (_request: NextRequest, { userId, params }) => {
    const snippet = await prisma.snippet.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!snippet) {
      throw ApiError.notFound("Snippet introuvable.");
    }

    if (snippet.userId !== userId) {
      throw ApiError.forbidden("Vous n'etes pas l'auteur de ce snippet.");
    }

    await prisma.snippet.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Snippet supprime avec succes.",
    });
  },
);
