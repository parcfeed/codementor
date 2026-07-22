import { render, screen } from "@testing-library/react";
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
