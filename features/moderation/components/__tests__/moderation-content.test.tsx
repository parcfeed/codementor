import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

import { ModerationContent } from "@/features/moderation/components/moderation-content";

const baseReport: {
  id: string;
  reason: string;
  status: "PENDING" | "REVIEWED" | "DISMISSED";
  createdAt: Date;
  reporter: { id: string; name: string };
  review: {
    id: string;
    rating: number;
    reviewer: { id: string; name: string };
    snippet: { id: string; language: string };
  };
} = {
  id: "report-1",
  reason: "Review non constructive",
  status: "PENDING",
  createdAt: new Date("2026-01-01"),
  reporter: { id: "user-1", name: "Alice" },
  review: {
    id: "review-1",
    rating: 1,
    reviewer: { id: "user-2", name: "Bob" },
    snippet: { id: "snippet-1", language: "typescript" },
  },
};

function setup(reports?: (typeof baseReport)[]) {
  return render(<ModerationContent reports={reports ?? [baseReport]} />);
}

describe("ModerationContent", () => {
  it("renders pending reports section", () => {
    setup();

    expect(screen.getByText("En attente (1)")).toBeInTheDocument();
    expect(screen.getByText("Review non constructive")).toBeInTheDocument();
  });

  it("renders empty state when no reports", () => {
    setup([]);

    expect(
      screen.getByText("Aucun signalement pour le moment"),
    ).toBeInTheDocument();
  });

  it("renders archived reports section", () => {
    const reviewedReport = { ...baseReport, status: "REVIEWED" as const };
    setup([reviewedReport]);

    expect(screen.getByText("Archive (1)")).toBeInTheDocument();
  });
});

describe("ModerationContent - status update", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("calls PATCH with the correct reportId and status, then refreshes", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    setup();

    fireEvent.click(
      screen.getByRole("button", { name: "Ignorer le signalement" }),
    );

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/reports/report-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "DISMISSED" }),
        }),
      ),
    );
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows an error message and does not update local state when PATCH fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: { code: "FORBIDDEN", message: "Privileges revoques." },
      }),
    });

    setup();

    fireEvent.click(
      screen.getByRole("button", { name: "Ignorer le signalement" }),
    );

    await waitFor(() =>
      expect(screen.getByText("Privileges revoques.")).toBeInTheDocument(),
    );

    expect(screen.getByText("En attente (1)")).toBeInTheDocument();
  });
});
