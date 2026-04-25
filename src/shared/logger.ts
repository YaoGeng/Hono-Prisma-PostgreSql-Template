type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  console[level](JSON.stringify(payload));
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>): void => {
    log("info", message, context);
  },
  warn: (message: string, context?: Record<string, unknown>): void => {
    log("warn", message, context);
  },
  error: (message: string, context?: Record<string, unknown>): void => {
    log("error", message, context);
  },
};
