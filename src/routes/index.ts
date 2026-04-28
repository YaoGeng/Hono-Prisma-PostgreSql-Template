/**
 * 路由注册中心。
 * 聚合所有业务模块的子路由，统一挂载路径前缀。
 * index.ts 只需导入这一个模块即可完成路由注册。
 */
import { Hono } from "hono";
import { authRoutes } from "./auth/auth.routes";
import { userRoutes } from "./user/user.routes";

const routes = new Hono();
routes.route("/auth", authRoutes);
routes.route("/user", userRoutes);

export { routes };
