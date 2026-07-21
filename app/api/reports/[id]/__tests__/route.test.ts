// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it, beforeEach, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  getAuthSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    report: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { PATCH } from "../route";

function createRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/reports/report-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/reports/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows moderator to set REVIEWED status", async () => {
    const { getAuthSession } = await import("@/lib/session");
    (getAuthSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "mod-1", isModerator: true },
    });
    const { prisma } = await import("@/lib/prisma");
    (prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "report-1",
    });

    const response = await PATCH(createRequest({ status: "REVIEWED" }), {
      params: { id: "report-1" },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain("traite");
  });

  it("allows moderator to set DISMISSED status", async () => {
    const { getAuthSession } = await import("@/lib/session");
    (getAuthSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "mod-1", isModerator: true },
    });
    const { prisma } = await import("@/lib/prisma");
    (prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "report-1",
    });

    const response = await PATCH(createRequest({ status: "DISMISSED" }), {
      params: { id: "report-1" },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toContain("ignore");
  });

  it("returns 403 for non-moderator user", async () => {
    const { getAuthSession } = await import("@/lib/session");
    (getAuthSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user-1", isModerator: false },
    });

    const response = await PATCH(createRequest({ status: "REVIEWED" }), {
      params: { id: "report-1" },
    });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it("returns 401 for unauthenticated request", async () => {
    const { getAuthSession } = await import("@/lib/session");
    (getAuthSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const response = await PATCH(createRequest({ status: "REVIEWED" }), {
      params: { id: "report-1" },
    });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it("returns 400 for invalid status", async () => {
    const { getAuthSession } = await import("@/lib/session");
    (getAuthSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "mod-1", isModerator: true },
    });

    const response = await PATCH(createRequest({ status: "INVALID" }), {
      params: { id: "report-1" },
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 when report does not exist", async () => {
    const { getAuthSession } = await import("@/lib/session");
    (getAuthSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "mod-1", isModerator: true },
    });
    const { prisma } = await import("@/lib/prisma");
    (prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );

    const response = await PATCH(createRequest({ status: "REVIEWED" }), {
      params: { id: "nonexistent" },
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
  });
});
