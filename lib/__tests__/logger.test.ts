import { beforeEach, describe, expect, it, vi } from "vitest";

import { logger } from "@/lib/logger";

describe("logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("logs info messages", () => {
    logger.info("test info");

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("[INFO] test info"),
    );
  });

  it("logs warn messages", () => {
    logger.warn("test warn");

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("[WARN] test warn"),
    );
  });

  it("logs error messages", () => {
    logger.error("test error");

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[ERROR] test error"),
    );
  });

  it("includes timestamp", () => {
    logger.info("time-test");

    const mockLog = console.log as ReturnType<typeof vi.spyOn>;
    const call = mockLog.mock.lastCall?.[0] as string;
    expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
  });

  it("redacts sensitive keys", () => {
    logger.info("login", { email: "test@test.com", password: "secret123" });

    const mockLog = console.log as ReturnType<typeof vi.spyOn>;
    const lastCall = mockLog.mock.lastCall?.[0] as string;
    expect(lastCall).toContain("[REDACTED]");
    expect(lastCall).not.toContain("secret123");
  });
});
