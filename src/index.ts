import { env } from "./config/env";
import { logger } from "./shared/logger";

function registerProcessHandlers(): void {
  process.on("SIGTERM", () => {
    logger.info("Received SIGTERM, shutting down");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    logger.info("Received SIGINT, shutting down");
    process.exit(0);
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", { error: String(error) });
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection", { reason: String(reason) });
    process.exit(1);
  });
}

async function bootstrap(): Promise<void> {
  registerProcessHandlers();

  logger.info("Application initialized", {
    appEnv: env.APP_ENV,
    nodeEnv: env.NODE_ENV,
  });
}

void bootstrap();
