import { ApiError } from "@/lib/errors";

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

export function checkRateLimit(key: string, max?: number): void {
  const limit = max ?? MAX_REQUESTS;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  entry.count += 1;

  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    const error = ApiError.rateLimited();
    error.retryAfter = retryAfter;
    throw error;
  }
}

export function resetRateLimitStore(): void {
  store.clear();
}
