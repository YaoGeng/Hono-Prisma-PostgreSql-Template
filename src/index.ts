/**
 * 应用入口文件
 * 初始化 Hono 实例、挂载路由、启动服务，并注册进程信号与异常处理
 */

import type { ServerType } from "@hono/node-server";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { authRoutes, meHandler } from "./auth/auth.routes";
import { authMiddleware } from "./auth/auth.middleware";

import { env } from "./config/env";
import { logger } from "./shared/logger";

// —— 进程信号与未捕获异常处理 ——
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
  // 创建 Hono 应用实例
  const app = new Hono();

  // 挂载认证路由
  app.route("/auth", authRoutes);

  // 挂载受保护的 /me 端点
  app.get("/me", authMiddleware, meHandler);

  // 启动 HTTP 服务
  const server = serve({
    fetch: app.fetch,
    port: env.PORT,
  });

  registerProcessHandlers(server);

  logger.info("Server started", { port: env.PORT });
}

// 应用入口
void bootstrap();
