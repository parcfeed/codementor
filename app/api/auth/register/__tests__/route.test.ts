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

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

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

function createRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
