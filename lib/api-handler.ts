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
      const { getAuthSession } = await import("@/lib/session");
      const session = await getAuthSession();

      if (!session?.user) {
        return NextResponse.json(
          {
            success: false,
            message: "Vous devez etre connecte.",
            error: {
              code: "UNAUTHORIZED",
              message: "Vous devez etre connecte.",
            },
          },
          { status: 401 },
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
      const { getAuthSession } = await import("@/lib/session");
      const session = await getAuthSession();

      if (!session?.user) {
        return NextResponse.json(
          {
            success: false,
            message: "Vous devez etre connecte.",
            error: {
              code: "UNAUTHORIZED",
              message: "Vous devez etre connecte.",
            },
          },
          { status: 401 },
        ) as NextResponse<T>;
      }

      if (!session.user.isModerator) {
        return NextResponse.json(
          {
            success: false,
            message: "Acces moderateur requis.",
            error: { code: "FORBIDDEN", message: "Acces moderateur requis." },
          },
          { status: 403 },
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

function formatError(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      success: false,
      message,
      error: { code, message, ...(details ? { details } : {}) },
    },
    { status },
  );
}

function handleError(error: unknown, url: string): NextResponse {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      logger.error(error.message, { url, code: error.code });
    }
    return formatError(error.status, error.code, error.message, error.details);
  }

  if (error instanceof ZodError) {
    const errors = error.flatten().fieldErrors;
    logger.warn("Validation error", { url, errors });
    return formatError(
      400,
      "VALIDATION_ERROR",
      "Les donnees transmises sont invalides.",
      { errors },
    );
  }

  const prismaError = handlePrismaError(error);
  if (prismaError.status !== 500) {
    return formatError(
      prismaError.status,
      prismaError.code,
      prismaError.message,
      prismaError.details,
    );
  }

  logger.error("Unhandled error", {
    url,
    error: error instanceof Error ? error.message : String(error),
  });

  return formatError(500, "INTERNAL_ERROR", "Une erreur est survenue.");
}
