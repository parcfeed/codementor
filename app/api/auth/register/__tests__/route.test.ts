// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it, beforeEach, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const rateLimitStore = new Map<string, number>();

vi.mock("@/lib/rate-limit", async () => {
  const { ApiError } =
    await vi.importActual<typeof import("@/lib/errors")>("@/lib/errors");
  return {
    checkRateLimit: vi.fn((key: string, max?: number) => {
      const count = (rateLimitStore.get(key) ?? 0) + 1;
      rateLimitStore.set(key, count);
      if (count > (max ?? 20)) {
        throw ApiError.rateLimited();
      }
    }),
  };
});

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(() => Promise.resolve("hashed-password")),
    compare: vi.fn(),
  },
}));

import { POST } from "../route";

function createRequest(body: unknown, ip?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (ip) {
    headers["x-forwarded-for"] = ip;
  }
  return new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitStore.clear();
  });

  it("creates a user and returns 201", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );
    (prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "new@test.com",
      name: "New User",
      reputationScore: 0,
      createdAt: new Date("2026-01-01"),
    });

    const response = await POST(
      createRequest({
        email: "new@test.com",
        name: "New User",
        password: "StrongP@ss1",
      }),
      { params: {} },
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.user.id).toBe("user-1");
    expect(body.user).not.toHaveProperty("passwordHash");
  });

  it("returns 409 when email already exists", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "existing-user",
    });

    const response = await POST(
      createRequest({
        email: "existing@test.com",
        name: "Existing",
        password: "StrongP@ss1",
      }),
      { params: {} },
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.success).toBe(false);
  });

  it("returns 400 for invalid email", async () => {
    const response = await POST(
      createRequest({
        email: "not-an-email",
        name: "Bad Email",
        password: "StrongP@ss1",
      }),
      { params: {} },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for weak password", async () => {
    const response = await POST(
      createRequest({
        email: "test@test.com",
        name: "Weak",
        password: "short",
      }),
      { params: {} },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for short name", async () => {
    const response = await POST(
      createRequest({
        email: "test@test.com",
        name: "A",
        password: "StrongP@ss1",
      }),
      { params: {} },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("blocks email rate limit even with different IPs (second factor)", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );

    for (let i = 0; i < 5; i++) {
      const res = await POST(
        createRequest(
          { email: "target@test.com", name: "Target", password: "StrongP@ss1" },
          `10.0.0.${i}`,
        ),
        { params: {} },
      );
      expect(res.status).toBe(201);
    }

    const blocked = await POST(
      createRequest(
        { email: "target@test.com", name: "Target", password: "StrongP@ss1" },
        "10.0.0.99",
      ),
      { params: {} },
    );
    const body = await blocked.json();

    expect(blocked.status).toBe(429);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("RATE_LIMITED");
  });

  it("does not share email key across different emails with same IP", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );

    const res1 = await POST(
      createRequest(
        { email: "alice@test.com", name: "Alice", password: "StrongP@ss1" },
        "10.0.0.1",
      ),
      { params: {} },
    );
    expect(res1.status).toBe(201);

    const res2 = await POST(
      createRequest(
        { email: "bob@test.com", name: "Bob", password: "StrongP@ss1" },
        "10.0.0.1",
      ),
      { params: {} },
    );
    expect(res2.status).toBe(201);
  });
});
