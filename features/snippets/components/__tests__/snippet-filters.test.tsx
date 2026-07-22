import { act, fireEvent, render, screen } from "@testing-library/react";
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

describe("SnippetFilters - applying filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("navigates with the correct query string when difficulty is selected", () => {
    render(<SnippetFilters />);

    fireEvent.change(screen.getByLabelText("Difficulte"), {
      target: { value: "ADVANCED" },
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: "Appliquer les filtres de recherche",
      }),
    );

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("difficulty=ADVANCED"),
    );
  });

  it("navigates on Enter key in the search field, same URL as the Filtrer button", () => {
    render(<SnippetFilters />);

    const searchInput = screen.getByPlaceholderText(
      "Rechercher dans le code...",
    );
    fireEvent.change(searchInput, { target: { value: "async function" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("search=async"),
    );
  });

  it("combines language, difficulty and sort in the same navigation call", () => {
    render(<SnippetFilters />);

    act(() => {
      fireEvent.change(screen.getByLabelText("Langage"), {
        target: { value: "python" },
      });
    });
    act(() => {
      fireEvent.change(screen.getByLabelText("Difficulte"), {
        target: { value: "BEGINNER" },
      });
    });
    act(() => {
      fireEvent.change(screen.getByLabelText("Trier par"), {
        target: { value: "popular" },
      });
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: "Appliquer les filtres de recherche",
      }),
    );

    const calledUrl = mockPush.mock.calls[0][0] as string;
    expect(calledUrl).toContain("language=python");
    expect(calledUrl).toContain("difficulty=BEGINNER");
    expect(calledUrl).toContain("sort=popular");
  });
});
