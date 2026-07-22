import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRefresh = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: mockPush }),
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

import { RegisterForm } from "@/features/auth/components/register-form";

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields and submit button", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Nom")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Creer le compte" }),
    ).toBeInTheDocument();
  });

  it("shows login link", () => {
    render(<RegisterForm />);

    expect(
      screen.getByRole("link", { name: "Se connecter" }),
    ).toBeInTheDocument();
  });
});

describe("RegisterForm - submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  async function fillAndSubmit() {
    const user = userEvent.setup();

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Nom"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Mot de passe"), "SuperSecret123");
    await user.click(
      screen.getByRole("button", { name: "Creer le compte" }),
    );
  }

  it("submits the form data to /api/auth/register", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await fillAndSubmit();

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/register",
        expect.objectContaining({ method: "POST" }),
      ),
    );
  });

  it("shows the backend error message on failure (non-regression on result.message bug)", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Un compte existe deja avec cette adresse email.",
        },
      }),
    });

    await fillAndSubmit();

    await waitFor(() =>
      expect(
        screen.getByText("Un compte existe deja avec cette adresse email."),
      ).toBeInTheDocument(),
    );
  });
});
