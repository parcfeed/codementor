// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { ApiError } from "@/lib/errors";

const mockTx = {
  vote: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
  },
  review: {
    findUnique: vi.fn(),
  },
  user: {
    update: vi.fn(),
  },
};

vi.mock("@/lib/session", () => ({
  getAuthSession: vi.fn(() =>
    Promise.resolve({
      user: { id: "user-1", isModerator: false, name: "Test" },
    }),
  ),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    review: {
      findUnique: vi.fn(),
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

vi.mock("@/lib/reputation", () => ({
  updateReviewerReputation: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { POST } from "../route";

function createRequest(body: unknown, url = "http://localhost:3000") {
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/reviews/[id]/vote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTx.vote.findUnique.mockReset();
    mockTx.vote.create.mockReset();
    mockTx.vote.update.mockReset();
    mockTx.vote.delete.mockReset();
    mockTx.vote.aggregate.mockReset();
    mockTx.review.findUnique.mockReset();
  });

  it("creates a vote and returns updated score", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.review.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "review-1",
      reviewerId: "reviewer-1",
    });

    mockTx.review.findUnique.mockResolvedValue({
      id: "review-1",
      reviewerId: "reviewer-1",
    });
    mockTx.vote.findUnique.mockResolvedValue(null);
    mockTx.vote.aggregate.mockResolvedValue({ _sum: { value: 1 } });

    const response = await POST(createRequest({ value: 1 }), {
      params: { id: "review-1" },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.score).toBe(1);
    expect(body.userVote).toBe(1);
    expect(mockTx.vote.create).toHaveBeenCalledWith({
      data: { reviewId: "review-1", userId: "user-1", value: 1 },
    });
  });

  it("toggles off when same vote sent twice", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.review.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "review-1",
      reviewerId: "reviewer-1",
    });

    mockTx.review.findUnique.mockResolvedValue({
      id: "review-1",
      reviewerId: "reviewer-1",
    });
    mockTx.vote.findUnique.mockResolvedValue({
      id: "vote-1",
      value: 1,
    });
    mockTx.vote.aggregate.mockResolvedValue({ _sum: { value: 0 } });

    const response = await POST(createRequest({ value: 1 }), {
      params: { id: "review-1" },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.score).toBe(0);
    expect(body.userVote).toBeNull();
    expect(mockTx.vote.delete).toHaveBeenCalledWith({
      where: { id: "vote-1" },
    });
  });

  it("updates vote when different value sent", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.review.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "review-1",
      reviewerId: "reviewer-1",
    });

    mockTx.review.findUnique.mockResolvedValue({
      id: "review-1",
      reviewerId: "reviewer-1",
    });
    mockTx.vote.findUnique.mockResolvedValue({
      id: "vote-1",
      value: 1,
    });
    mockTx.vote.aggregate.mockResolvedValue({ _sum: { value: -1 } });

    const response = await POST(createRequest({ value: -1 }), {
      params: { id: "review-1" },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.score).toBe(-1);
    expect(body.userVote).toBe(-1);
    expect(mockTx.vote.update).toHaveBeenCalledWith({
      where: { id: "vote-1" },
      data: { value: -1 },
    });
  });

  it("returns 403 when voting on own review", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.review.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "review-1",
      reviewerId: "user-1",
    });

    const response = await POST(createRequest({ value: 1 }), {
      params: { id: "review-1" },
    });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it("returns 404 when review does not exist", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.review.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );

    const response = await POST(createRequest({ value: 1 }), {
      params: { id: "nonexistent" },
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
  });

  it("returns 400 for invalid vote value", async () => {
    const response = await POST(createRequest({ value: 42 }), {
      params: { id: "review-1" },
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("does not persist the vote if reputation update fails inside the transaction", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.review.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "review-1",
      reviewerId: "reviewer-1",
    });

    mockTx.vote.findUnique.mockResolvedValue(null);

    const { updateReviewerReputation } = await import("@/lib/reputation");
    (
      updateReviewerReputation as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error("DB write failed"));

    const response = await POST(createRequest({ value: 1 }), {
      params: { id: "review-1" },
    });

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const rateError = ApiError.rateLimited();
    rateError.retryAfter = 30;
    (checkRateLimit as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw rateError;
    });

    const response = await POST(createRequest({ value: 1 }), {
      params: { id: "review-1" },
    });

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");
  });
});
