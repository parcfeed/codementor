export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  retryAfter?: number;

  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static validation(
    message: string,
    details?: Record<string, unknown>,
  ): ApiError {
    return new ApiError("VALIDATION_ERROR", message, 400, details);
  }

  static unauthorized(message = "Vous devez etre connecte."): ApiError {
    return new ApiError("UNAUTHORIZED", message, 401);
  }

  static forbidden(message = "Acces refuse."): ApiError {
    return new ApiError("FORBIDDEN", message, 403);
  }

  static notFound(message = "Ressource introuvable."): ApiError {
    return new ApiError("NOT_FOUND", message, 404);
  }

  static conflict(message = "Conflit."): ApiError {
    return new ApiError("CONFLICT", message, 409);
  }

  static rateLimited(
    message = "Trop de requetes. Veuillez reessayer plus tard.",
  ): ApiError {
    return new ApiError("RATE_LIMITED", message, 429);
  }

  static internal(message = "Une erreur est survenue."): ApiError {
    return new ApiError("INTERNAL_ERROR", message, 500);
  }

  toResponse(): {
    success: false;
    error: { code: string; message: string; details?: Record<string, unknown> };
  } {
    const response: {
      success: false;
      error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
      };
    } = {
      success: false,
      error: {
        code: this.code,
        message: this.message,
      },
    };
    if (this.details) {
      response.error.details = this.details;
    }
    return response;
  }
}

export function handlePrismaError(error: unknown): ApiError {
  if (typeof error === "object" && error !== null && "code" in error) {
    const prismaError = error as {
      code: string;
      meta?: Record<string, unknown>;
    };

    switch (prismaError.code) {
      case "P2002":
        return ApiError.conflict("Cette ressource existe deja.");
      case "P2025":
        return ApiError.notFound("Enregistrement introuvable.");
      case "P2003":
        return ApiError.validation("Contrainte de foreign key violee.");
      case "P2014":
        return ApiError.validation("Violation de relation requise.");
    }
  }
  return ApiError.internal();
}
