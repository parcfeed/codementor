// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it, beforeEach, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  getAuthSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
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
  return new NextRequest("http://localhost:3000/api/snippets/s1/reveal-author");
}

describe("GET /api/snippets/[id]/reveal-author", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for non-moderator user", async () => {
    const { getAuthSession } = await import("@/lib/session");
    (getAuthSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user-1", isModerator: false },
    });

    const response = await GET(createRequest(), { params: { id: "s1" } });

    expect(response.status).toBe(403);
  });

  it("returns author for moderator", async () => {
    const { getAuthSession } = await import("@/lib/session");
    (getAuthSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "mod-1", isModerator: true },
    });
    const { prisma } = await import("@/lib/prisma");
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      isModerator: true,
    });
    (prisma.snippet.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "s1",
      isAnonymous: true,
      user: { id: "u1", name: "Alice", email: "alice@test.com" },
    });

    const response = await GET(createRequest(), { params: { id: "s1" } });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.author).toEqual({
      id: "u1",
      name: "Alice",
      email: "alice@test.com",
    });
    expect(json.wasAnonymous).toBe(true);
  });

  it("logs the desanonymization action", async () => {
    const { getAuthSession } = await import("@/lib/session");
    (getAuthSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "mod-1", isModerator: true },
    });
    const { prisma } = await import("@/lib/prisma");
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      isModerator: true,
    });
    (prisma.snippet.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "s1",
      isAnonymous: true,
      user: { id: "u1", name: "Alice", email: "alice@test.com" },
    });
    const { logger } = await import("@/lib/logger");

    await GET(createRequest(), { params: { id: "s1" } });

    expect(logger.info).toHaveBeenCalledWith(
      "Desanonymisation d'un snippet par un moderateur",
      expect.objectContaining({
        moderatorId: "mod-1",
        snippetId: "s1",
      }),
    );
  });
});
