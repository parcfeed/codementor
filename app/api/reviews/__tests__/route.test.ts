// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it, beforeEach, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  getAuthSession: vi.fn(() =>
    Promise.resolve({
      user: { id: "user-1", isModerator: false, name: "Test" },
    }),
  ),
}));

const mockTx = {
  review: {
    create: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    snippet: {
      findUnique: vi.fn(),
    },
    review: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn((cb: (tx: typeof mockTx) => unknown) => cb(mockTx)),
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/badges", () => ({
  checkAndAwardBadges: vi.fn(() => Promise.resolve([])),
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { POST } from "../route";

function createRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/reviews — lineNumber validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTx.review.create.mockReset();
  });

  it("returns 400 when lineNumber exceeds snippet line count", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.snippet.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "snippet-1",
      userId: "author-1",
      code: "line1\nline2\nline3",
    });

    const response = await POST(
      createRequest({
        snippetId: "snippet-1",
        rating: 4,
        comments: [{ lineNumber: 10, content: "Out of bounds" }],
      }),
      { params: {} },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toContain("10");
  });

  it("accepts lineNumber equal to number of lines", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.snippet.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "snippet-2",
      userId: "author-2",
      code: "line1\nline2\nline3",
    });
    (prisma.review.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );
    mockTx.review.create.mockResolvedValue({
      id: "review-1",
      snippetId: "snippet-2",
      reviewerId: "user-1",
      rating: 4,
      createdAt: new Date(),
      reviewer: { id: "user-1", name: "Test" },
      comments: [{ lineNumber: 3, content: "OK" }],
    });

    const response = await POST(
      createRequest({
        snippetId: "snippet-2",
        rating: 4,
        comments: [{ lineNumber: 3, content: "Looks good" }],
      }),
      { params: {} },
    );

    expect(response.status).toBe(201);
  });

  it("accepts comments with lineNumber within bounds", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.snippet.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "snippet-3",
      userId: "author-3",
      code: "a\nb\nc\nd\ne",
    });
    (prisma.review.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );
    mockTx.review.create.mockResolvedValue({
      id: "review-3",
      snippetId: "snippet-3",
      reviewerId: "user-1",
      rating: 5,
      createdAt: new Date(),
      reviewer: { id: "user-1", name: "Test" },
      comments: [
        { lineNumber: 1, content: "Nice" },
        { lineNumber: 5, content: "Last line" },
      ],
    });

    const response = await POST(
      createRequest({
        snippetId: "snippet-3",
        rating: 5,
        comments: [
          { lineNumber: 1, content: "Nice" },
          { lineNumber: 5, content: "Last line" },
        ],
      }),
      { params: {} },
    );

    expect(response.status).toBe(201);
  });
});
