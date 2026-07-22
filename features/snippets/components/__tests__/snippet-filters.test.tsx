import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRefresh = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: mockPush }),
  useSearchParams: () => new URLSearchParams("sort=recent"),
}));

import { SnippetFilters } from "@/features/snippets/components/snippet-filters";

describe("SnippetFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search input and filter fields", () => {
    render(<SnippetFilters />);

    expect(
      screen.getByPlaceholderText("Rechercher dans le code..."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Langage")).toBeInTheDocument();
    expect(screen.getByLabelText("Difficulte")).toBeInTheDocument();
    expect(screen.getByLabelText("Trier par")).toBeInTheDocument();
  });

  it("renders difficulty options", () => {
    render(<SnippetFilters />);

    const difficulty = screen.getByLabelText("Difficulte");
    expect(difficulty).toBeInTheDocument();
  });

  it("renders sort options with API vocabulary", () => {
    render(<SnippetFilters />);

    const sort = screen.getByLabelText("Trier par");
    expect(sort).toBeInTheDocument();
  });
});
