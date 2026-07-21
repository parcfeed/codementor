import { NextRequest, NextResponse } from "next/server";

import { moderatorHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const PATCH = moderatorHandler(
  async (request: NextRequest, { params }) => {
    const body = await request.json();
    const { status } = body;

    if (status !== "REVIEWED" && status !== "DISMISSED") {
      throw ApiError.validation("Le statut doit etre REVIEWED ou DISMISSED.");
    }

    const report = await prisma.report.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!report) {
      throw ApiError.notFound("Signalement introuvable.");
    }

    await prisma.report.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message:
        status === "REVIEWED"
          ? "Signalement marque comme traite."
          : "Signalement ignore.",
    });
  },
);
