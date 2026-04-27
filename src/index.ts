import type { ServerType } from "@hono/node-server";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { authRoutes, meHandler } from "./auth/auth.routes";
import { authMiddleware } from "./auth/auth.middleware";

import { env } from "./config/env";
import { logger } from "./shared/logger";

function registerProcessHandlers(server: ServerType): void {
  process.on("SIGTERM", () => {
    logger.info("Received SIGTERM, shutting down");
    server.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    logger.info("Received SIGINT, shutting down");
    server.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
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
  const app = new Hono();

  // Mount auth routes
  app.route("/auth", authRoutes);

  // Mount protected /me endpoint at root
  app.get("/me", authMiddleware, meHandler);

  const server = serve({
    fetch: app.fetch,
    port: env.PORT,
  });

  registerProcessHandlers(server);

  logger.info("Server started", { port: env.PORT });
}

void bootstrap();
