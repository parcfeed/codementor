import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError, handlePrismaError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

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

function generateRequestId(): string {
  return crypto.randomUUID();
}

function handleError(
  error: unknown,
  url: string,
  requestId?: string,
): NextResponse {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      logger.error(error.message, { url, code: error.code, requestId });
    }
    const response = toJsonResponse(error.status, error.toResponse());
    if (error.retryAfter !== undefined) {
      response.headers.set("Retry-After", String(error.retryAfter));
    }
    return response;
  }

  if (error instanceof ZodError) {
    const errors = error.flatten().fieldErrors;
    logger.warn("Validation error", { url, errors, requestId });
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
    requestId,
  });

  return toJsonResponse(500, ApiError.internal().toResponse());
}

async function resolveSession(): Promise<{
  userId: string;
  isModerator: boolean;
}> {
  const { getAuthSession } = await import("@/lib/session");
  const session = await getAuthSession();

  if (!session?.user) {
    throw ApiError.unauthorized();
  }

  return {
    userId: session.user.id,
    isModerator: session.user.isModerator ?? false,
  };
}

export function apiHandler<T>(handler: ApiHandler<T>): ApiHandler<T> {
  return async (req, context) => {
    const requestId = generateRequestId();
    try {
      return await handler(req, context);
    } catch (error) {
      return handleError(error, req.url, requestId) as NextResponse<T>;
    }
  };
}

export function authenticatedHandler<T>(
  handler: AuthenticatedHandler<T>,
): ApiHandler<T> {
  return async (req, context) => {
    const requestId = generateRequestId();
    try {
      const session = await resolveSession();

      return await handler(req, {
        ...context,
        userId: session.userId,
        isModerator: session.isModerator,
      });
    } catch (error) {
      return handleError(error, req.url, requestId) as NextResponse<T>;
    }
  };
}

export function moderatorHandler<T>(
  handler: AuthenticatedHandler<T>,
): ApiHandler<T> {
  return async (req, context) => {
    const requestId = generateRequestId();
    try {
      const session = await resolveSession();

      if (!session.isModerator) {
        throw ApiError.forbidden("Acces moderateur requis.");
      }

      // Le JWT peut etre perime (isModerator revoque en base apres la
      // connexion). Revalider directement contre la base pour cette
      // route sensible plutot que de faire confiance au token signe.
      const freshUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { isModerator: true },
      });

      if (!freshUser?.isModerator) {
        throw ApiError.forbidden(
          "Acces moderateur requis (privileges revoques).",
        );
      }

      return await handler(req, {
        ...context,
        userId: session.userId,
        isModerator: true,
      });
    } catch (error) {
      return handleError(error, req.url, requestId) as NextResponse<T>;
    }
  };
}
