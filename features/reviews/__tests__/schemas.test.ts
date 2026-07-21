import { describe, expect, it } from "vitest";

import {
  createReviewSchema,
  lineCommentSchema,
  voteSchema,
} from "@/features/reviews/schemas";

describe("lineCommentSchema", () => {
  it("accepts a valid comment", () => {
    const result = lineCommentSchema.safeParse({
      lineNumber: 5,
      content: "Great code",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-positive line number", () => {
    const result = lineCommentSchema.safeParse({
      lineNumber: 0,
      content: "Bad line",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty content", () => {
    const result = lineCommentSchema.safeParse({
      lineNumber: 1,
      content: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("createReviewSchema", () => {
  it("accepts a valid review", () => {
    const result = createReviewSchema.safeParse({
      snippetId: "abc-123",
      rating: 4,
      comments: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects out-of-range rating", () => {
    const result = createReviewSchema.safeParse({
      snippetId: "abc-123",
      rating: 6,
    });
    expect(result.success).toBe(false);
  });
});

describe("voteSchema", () => {
  it("accepts vote value 1", () => {
    const result = voteSchema.safeParse({ value: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts vote value -1", () => {
    const result = voteSchema.safeParse({ value: -1 });
    expect(result.success).toBe(true);
  });

  it("rejects invalid vote value", () => {
    const result = voteSchema.safeParse({ value: 0 });
    expect(result.success).toBe(false);
  });
});
