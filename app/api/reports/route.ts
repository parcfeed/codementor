import { NextResponse } from "next/server";

import { moderatorHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";

export const GET = moderatorHandler(async () => {
  const reports = await prisma.report.findMany({
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
        },
      },
      review: {
        select: {
          id: true,
          rating: true,
          reviewer: {
            select: {
              id: true,
              name: true,
            },
          },
          snippet: {
            select: {
              id: true,
              language: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ success: true, reports });
});
