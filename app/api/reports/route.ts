import { NextRequest, NextResponse } from "next/server";

import { moderatorHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";

export const GET = moderatorHandler(async (request: NextRequest) => {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)),
  );
  const status = url.searchParams.get("status");

  const where =
    status &&
    ["PENDING", "REVIEWED", "DISMISSED"].includes(status.toUpperCase())
      ? { status: status.toUpperCase() as "PENDING" | "REVIEWED" | "DISMISSED" }
      : {};

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      include: {
        reporter: {
          select: { id: true, name: true },
        },
        review: {
          select: {
            id: true,
            rating: true,
            reviewer: {
              select: { id: true, name: true },
            },
            snippet: {
              select: { id: true, language: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.report.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
