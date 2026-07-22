import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

describe("VoteButtons - vote submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("optimistically increments score on click before response resolves", async () => {
    let resolveFetch: (value: unknown) => void;
    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    setup({ initialScore: 5, initialUserVote: null });

    fireEvent.click(screen.getByRole("button", { name: "Vote positif" }));

    expect(screen.getByText("6")).toBeInTheDocument();

    resolveFetch!({
      ok: true,
      json: async () => ({ score: 6, userVote: 1 }),
    });

    await waitFor(() => expect(screen.getByText("6")).toBeInTheDocument());
  });

  it("rolls back the optimistic update and shows an error on failure", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Trop de votes, reessayez plus tard.",
        },
      }),
    });

    setup({ initialScore: 5, initialUserVote: null });

    fireEvent.click(screen.getByRole("button", { name: "Vote positif" }));

    await waitFor(() =>
      expect(
        screen.getByText("Trop de votes, reessayez plus tard."),
      ).toBeInTheDocument(),
    );

    expect(screen.getByText("5")).toBeInTheDocument();

    const errorNode = screen.getByText("Trop de votes, reessayez plus tard.");
    expect(errorNode.getAttribute("aria-live")).toBe("polite");
  });

  it("shows a network error message when fetch throws", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("network down"),
    );

    setup({ initialScore: 5, initialUserVote: null });

    fireEvent.click(screen.getByRole("button", { name: "Vote positif" }));

    await waitFor(() =>
      expect(
        screen.getByText("Une erreur reseau est survenue."),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("auto-dismisses the error message after 5 seconds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: { code: "FORBIDDEN", message: "Action non autorisee." },
      }),
    });

    setup({ initialScore: 5, initialUserVote: null });

    fireEvent.click(screen.getByRole("button", { name: "Vote positif" }));

    await vi.waitFor(() =>
      expect(screen.getByText("Action non autorisee.")).toBeInTheDocument(),
    );

    await vi.advanceTimersByTimeAsync(5000);

    expect(
      screen.queryByText("Action non autorisee."),
    ).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it("does not call fetch when isOwnReview is true", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    setup({ isOwnReview: true });

    fireEvent.click(screen.getByRole("button", { name: "Vote positif" }));

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
