import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError, handlePrismaError } from "@/lib/errors";
import { logger } from "@/lib/logger";

type HandlerContext = {
  params: Record<string, string>;
};

type ApiHandler<T = unknown> = (
  req: NextRequest,
  context: HandlerContext,
) => Promise<NextResponse<T>>;

type AuthenticatedHandler<T = unknown> = (
  req: NextRequest,
  context: HandlerContext & { userId: string; isModerator: boolean },
) => Promise<NextResponse<T>>;

function toJsonResponse(
  status: number,
  body: Record<string, unknown>,
): NextResponse {
  return NextResponse.json(body, { status }) as NextResponse;
}

function handleError(error: unknown, url: string): NextResponse {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      logger.error(error.message, { url, code: error.code });
    }
    const response = toJsonResponse(error.status, error.toResponse());
    if (error.retryAfter !== undefined) {
      response.headers.set("Retry-After", String(error.retryAfter));
    }
    return response;
  }

  if (error instanceof ZodError) {
    const errors = error.flatten().fieldErrors;
    logger.warn("Validation error", { url, errors });
    return toJsonResponse(400, {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Les donnees transmises sont invalides.",
        details: { errors },
      },
    });
  }

  const prismaError = handlePrismaError(error);
  if (prismaError.status !== 500) {
    return toJsonResponse(prismaError.status, prismaError.toResponse());
  }

  logger.error("Unhandled error", {
    url,
    error: error instanceof Error ? error.message : String(error),
  });

  return toJsonResponse(500, ApiError.internal().toResponse());
}

async function getSessionOrThrow() {
  const { getAuthSession } = await import("@/lib/session");
  const session = await getAuthSession();
  return session;
}

export function apiHandler<T>(handler: ApiHandler<T>): ApiHandler<T> {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleError(error, req.url) as NextResponse<T>;
    }
  };
}

export function authenticatedHandler<T>(
  handler: AuthenticatedHandler<T>,
): ApiHandler<T> {
  return async (req, context) => {
    try {
      const session = await getSessionOrThrow();

      if (!session?.user) {
        return toJsonResponse(
          401,
          ApiError.unauthorized().toResponse(),
        ) as NextResponse<T>;
      }

      return await handler(req, {
        ...context,
        userId: session.user.id,
        isModerator: session.user.isModerator ?? false,
      });
    } catch (error) {
      return handleError(error, req.url) as NextResponse<T>;
    }
  };
}

export function moderatorHandler<T>(
  handler: AuthenticatedHandler<T>,
): ApiHandler<T> {
  return async (req, context) => {
    try {
      const session = await getSessionOrThrow();

      if (!session?.user) {
        return toJsonResponse(
          401,
          ApiError.unauthorized().toResponse(),
        ) as NextResponse<T>;
      }

      if (!session.user.isModerator) {
        return toJsonResponse(
          403,
          ApiError.forbidden("Acces moderateur requis.").toResponse(),
        ) as NextResponse<T>;
      }

      return await handler(req, {
        ...context,
        userId: session.user.id,
        isModerator: true,
      });
    } catch (error) {
      return handleError(error, req.url) as NextResponse<T>;
    }
  };
}
