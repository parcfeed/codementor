import { describe, expect, it } from "vitest";

import { ApiError, handlePrismaError } from "@/lib/errors";

describe("ApiError", () => {
  it("creates a validation error", () => {
    const error = ApiError.validation("Champ requis.");

    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.status).toBe(400);
    expect(error.message).toBe("Champ requis.");
  });

  it("creates a validation error with details", () => {
    const error = ApiError.validation("Invalide.", { field: "email" });

    expect(error.details).toEqual({ field: "email" });
  });

  it("creates an unauthorized error", () => {
    const error = ApiError.unauthorized();

    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.status).toBe(401);
  });

  it("creates a forbidden error", () => {
    const error = ApiError.forbidden();

    expect(error.code).toBe("FORBIDDEN");
    expect(error.status).toBe(403);
  });

  it("creates a not found error", () => {
    const error = ApiError.notFound();

    expect(error.code).toBe("NOT_FOUND");
    expect(error.status).toBe(404);
  });

  it("creates a conflict error", () => {
    const error = ApiError.conflict();

    expect(error.code).toBe("CONFLICT");
    expect(error.status).toBe(409);
  });

  it("creates a rate limited error", () => {
    const error = ApiError.rateLimited();

    expect(error.code).toBe("RATE_LIMITED");
    expect(error.status).toBe(429);
  });

  it("creates an internal error", () => {
    const error = ApiError.internal();

    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.status).toBe(500);
  });

  it("serializes to response format", () => {
    const error = ApiError.validation("Test", { x: 1 });
    const response = error.toResponse();

    expect(response.success).toBe(false);
    expect(response.error.code).toBe("VALIDATION_ERROR");
    expect(response.error.message).toBe("Test");
    expect(response.error.details).toEqual({ x: 1 });
  });
});

describe("handlePrismaError", () => {
  it("handles P2002 (unique constraint)", () => {
    const error = { code: "P2002", meta: {} };
    const apiError = handlePrismaError(error);

    expect(apiError.code).toBe("CONFLICT");
    expect(apiError.status).toBe(409);
  });

  it("handles P2025 (not found)", () => {
    const error = { code: "P2025", meta: {} };
    const apiError = handlePrismaError(error);

    expect(apiError.code).toBe("NOT_FOUND");
    expect(apiError.status).toBe(404);
  });

  it("handles P2003 (foreign key)", () => {
    const error = { code: "P2003", meta: {} };
    const apiError = handlePrismaError(error);

    expect(apiError.code).toBe("VALIDATION_ERROR");
    expect(apiError.status).toBe(400);
  });

  it("returns internal error for unknown codes", () => {
    const error = { code: "UNKNOWN" };
    const apiError = handlePrismaError(error);

    expect(apiError.status).toBe(500);
  });

  it("returns internal error for non-object input", () => {
    const apiError = handlePrismaError("string error");

    expect(apiError.status).toBe(500);
  });
});
