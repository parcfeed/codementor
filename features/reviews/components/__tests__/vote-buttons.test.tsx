import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRefresh = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: mockPush }),
}));

import { VoteButtons } from "@/features/reviews/components/vote-buttons";

function setup(
  props?: Partial<{
    reviewId: string;
    initialScore: number;
    initialUserVote: number | null;
    isOwnReview: boolean;
  }>,
) {
  return render(
    <VoteButtons
      reviewId={props?.reviewId ?? "review-1"}
      initialScore={props?.initialScore ?? 5}
      initialUserVote={props?.initialUserVote ?? null}
      isOwnReview={props?.isOwnReview ?? false}
    />,
  );
}

describe("VoteButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders score and vote buttons", () => {
    setup();

    expect(
      screen.getByRole("button", { name: "Vote positif" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Vote negatif" }),
    ).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("disables buttons for own review", () => {
    setup({ isOwnReview: true });

    expect(screen.getByRole("button", { name: "Vote positif" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Vote negatif" })).toBeDisabled();
  });

  it("shows initial user vote as active style", () => {
    setup({ initialUserVote: 1 });

    const upBtn = screen.getByRole("button", { name: "Vote positif" });
    expect(upBtn.className).toContain("border-success");
  });
});
