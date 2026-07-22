// @vitest-environment node
import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/features/auth/schemas";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@test.com",
      password: "anyPassword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({ email: "user@test.com" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@test.com",
      password: "securePass123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects weak password", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@test.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "invalid",
      password: "securePass123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      name: "J",
      email: "john@test.com",
      password: "securePass123",
    });
    expect(result.success).toBe(false);
  });
});
