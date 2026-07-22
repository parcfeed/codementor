// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it, beforeEach, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    snippet: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { GET } from "../route";

function createRequest() {
  return new NextRequest("http://localhost:3000/api/snippets/s1");
}

describe("GET /api/snippets/[id] — anonymization masking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("masks user when isAnonymous is true", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.snippet.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "s1",
      code: "print(1)",
      language: "python",
      difficulty: "BEGINNER",
      isAnonymous: true,
      userId: "u1",
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { id: "u1", name: "Alice" },
      _count: { reviews: 0 },
    });

    const response = await GET(createRequest(), { params: { id: "s1" } });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.snippet.user).toBeNull();
  });

  it("shows user when isAnonymous is false", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.snippet.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "s2",
      code: "console.log(1)",
      language: "javascript",
      difficulty: "INTERMEDIATE",
      isAnonymous: false,
      userId: "u2",
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { id: "u2", name: "Bob" },
      _count: { reviews: 1 },
    });

    const response = await GET(createRequest(), { params: { id: "s2" } });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.snippet.user).toEqual({ id: "u2", name: "Bob" });
  });
});
