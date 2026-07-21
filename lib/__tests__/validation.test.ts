import { describe, expect, it } from "vitest";

import {
  emailField,
  nameField,
  passwordField,
  languageField,
} from "@/lib/validation";

describe("emailField", () => {
  it("accepts a valid email", () => {
    const result = emailField.safeParse("Test@Example.com");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("test@example.com");
    }
  });

  it("rejects an invalid email", () => {
    const result = emailField.safeParse("not-an-email");
    expect(result.success).toBe(false);
  });

  it("trims whitespace", () => {
    const result = emailField.safeParse("  user@test.com  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("user@test.com");
    }
  });
});

describe("passwordField", () => {
  it("accepts a valid password", () => {
    const result = passwordField.safeParse("securePass123!");
    expect(result.success).toBe(true);
  });

  it("rejects a short password", () => {
    const result = passwordField.safeParse("1234567");
    expect(result.success).toBe(false);
  });

  it("rejects a password that is too long", () => {
    const result = passwordField.safeParse("a".repeat(129));
    expect(result.success).toBe(false);
  });
});

describe("nameField", () => {
  it("accepts a valid name", () => {
    const result = nameField.safeParse("John Doe");
    expect(result.success).toBe(true);
  });

  it("rejects a name that is too short", () => {
    const result = nameField.safeParse("A");
    expect(result.success).toBe(false);
  });

  it("rejects a name that is too long", () => {
    const result = nameField.safeParse("A".repeat(81));
    expect(result.success).toBe(false);
  });

  it("trims whitespace", () => {
    const result = nameField.safeParse("  John  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("John");
    }
  });
});

describe("languageField", () => {
  it("accepts a valid language", () => {
    const result = languageField.safeParse("typescript");
    expect(result.success).toBe(true);
  });

  it("rejects an invalid language", () => {
    const result = languageField.safeParse("cobol");
    expect(result.success).toBe(false);
  });
});
