import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { moderatorHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const updateReportSchema = z.object({
  status: z.enum(["REVIEWED", "DISMISSED"], {
    message: "Le statut doit etre REVIEWED ou DISMISSED.",
  }),
});

export const PATCH = moderatorHandler(
  async (request: NextRequest, { params }) => {
    const body = await request.json();
    const parsed = updateReportSchema.safeParse(body);

    if (!parsed.success) {
      throw ApiError.validation("Les donnees transmises sont invalides.", {
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { status } = parsed.data;

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
