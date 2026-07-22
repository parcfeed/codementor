// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it, beforeEach, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    snippet: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { GET } from "../route";

function createRequest(url: string) {
  return new NextRequest(url);
}

describe("GET /api/snippets — difficulty filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies difficulty filter when ?difficulty=BEGINNER", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.snippet.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "s1", language: "python", difficulty: "BEGINNER" },
    ]);
    (prisma.snippet.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const response = await GET(
      createRequest("http://localhost:3000/api/snippets?difficulty=BEGINNER"),
      { params: {} },
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.snippet.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { difficulty: "BEGINNER" },
      }),
    );
    expect(json.snippets).toHaveLength(1);
  });

  it("applies combined language and difficulty filter (AND)", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.snippet.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "s2", language: "python", difficulty: "ADVANCED" },
    ]);
    (prisma.snippet.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const response = await GET(
      createRequest(
        "http://localhost:3000/api/snippets?language=python&difficulty=ADVANCED",
      ),
      { params: {} },
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.snippet.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { language: "python", difficulty: "ADVANCED" },
      }),
    );
    expect(json.snippets).toHaveLength(1);
  });

  it("masks user when isAnonymous is true for listing", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.snippet.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "s1",
        language: "python",
        difficulty: "BEGINNER",
        isAnonymous: true,
        createdAt: new Date(),
        user: { id: "u1", name: "Alice" },
        _count: { reviews: 0 },
      },
      {
        id: "s2",
        language: "javascript",
        difficulty: "INTERMEDIATE",
        isAnonymous: false,
        createdAt: new Date(),
        user: { id: "u2", name: "Bob" },
        _count: { reviews: 1 },
      },
    ]);
    (prisma.snippet.count as ReturnType<typeof vi.fn>).mockResolvedValue(2);

    const response = await GET(
      createRequest("http://localhost:3000/api/snippets"),
      { params: {} },
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.snippets[0].user).toBeNull();
    expect(json.snippets[1].user).toEqual({ id: "u2", name: "Bob" });
  });

  it("ignores invalid difficulty and does not error", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.snippet.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.snippet.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    const response = await GET(
      createRequest("http://localhost:3000/api/snippets?difficulty=INVALID"),
      { params: {} },
    );

    expect(response.status).toBe(200);
    expect(prisma.snippet.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      }),
    );
  });
});
