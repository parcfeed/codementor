type LogLevel = "info" | "warn" | "error";

type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  context?: Record<string, unknown>;
};

type Transport = (entry: LogEntry) => void;

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "secret",
  "authorization",
  "cookie",
  "NEXTAUTH_SECRET",
  "DATABASE_URL",
]);

function sanitize(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key)) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitize(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

class Logger {
  private transports: Transport[] = [];

  constructor() {
    this.transports.push((entry) => {
      const rid = entry.requestId ? ` [${entry.requestId}]` : "";
      const prefix = `[${entry.timestamp}]${rid} [${entry.level.toUpperCase()}]`;
      const ctx = entry.context
        ? { ...entry.context, requestId: undefined }
        : undefined;
      const cleanCtx = ctx && Object.keys(ctx).length > 0 ? ctx : undefined;
      const line = cleanCtx
        ? `${prefix} ${entry.message} ${JSON.stringify(sanitize(cleanCtx))}`
        : `${prefix} ${entry.message}`;

      switch (entry.level) {
        case "error":
          console.error(line);
          break;
        case "warn":
          console.warn(line);
          break;
        default:
          console.log(line);
      }
    });
  }

  addTransport(transport: Transport): void {
    this.transports.push(transport);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    const requestId =
      context && typeof context.requestId === "string"
        ? (context.requestId as string)
        : undefined;
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId,
      context: context ? sanitize(context) : undefined,
    };
    for (const transport of this.transports) {
      try {
        transport(entry);
      } catch {
        // fail silently if a transport fails
      }
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log("error", message, context);
  }
}

export const logger = new Logger();
