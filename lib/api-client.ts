export type ApiErrorResponse = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

export function extractErrorMessage(
  payload: unknown,
  fallback: string,
): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof (payload.error as Record<string, unknown>).message === "string"
  ) {
    return (payload.error as Record<string, unknown>).message as string;
  }
  return fallback;
}
