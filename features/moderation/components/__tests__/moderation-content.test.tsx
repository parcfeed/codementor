import { render, screen } from "@testing-library/react";
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
