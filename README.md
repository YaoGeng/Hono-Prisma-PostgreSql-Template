# Prisma PostgreSQL 生产模板

面向 TypeScript + Prisma 的精简生产骨架，包含：

- 严格 TypeScript 编译与类型检查
- ESLint + Prettier 规范化
- 环境变量集中校验（`zod`）
- 结构化日志与进程级异常处理
- Prisma v7 配置（`prisma.config.ts` + adapter）

## 快速开始

```bash
npm install

# 创建本地环境变量文件（按需修改连接串）
cp .env.example .env
# 或手动创建：
# APP_ENV="dev"
# NODE_ENV="development"
# DATABASE_URL="postgresql://username:password@host:5432/mydb?schema=public"

npm run prisma:generate
npm run typecheck
npm run build
```

## 常用命令

- `npm run dev`：本地启动（watch 模式）
- `npm run dev:test`：测试环境配置启动（watch 模式）
- `npm run dev:prod`：生产环境配置启动（watch 模式）
- `npm run typecheck`：类型检查
- `npm run lint`：静态检查
- `npm run format:check`：格式检查
- `npm run build`：构建输出到 `dist`
- `npm run prisma:migrate`：执行迁移
- `npm run prisma:migrate:test`：测试环境迁移
- `npm run prisma:migrate:prod`：生产环境部署迁移
- `npm run prisma:studio`：打开 Prisma Studio

## 目录约定

- `src/`：应用源码
- `src/config/env.ts`：环境变量定义与校验
- `src/shared/logger.ts`：结构化日志
- `src/lib/prisma.ts`：Prisma 客户端实例
- `prisma/`：Schema 与迁移目录

## 环境管理

应用根据 `APP_ENV` 加载对应的 `.env.{APP_ENV}` 文件，再用 `.env` 补全缺失项。  
`dotenv` 设置了 `override: false`，即平台注入的环境变量始终优先于文件值。

加载优先级：**平台 / cross-env > `.env.{APP_ENV}` > `.env`**

### 本地开发

```bash
cp .env.example .env          # 开发数据库
cp .env.example .env.test     # 修改 DATABASE_URL 指向测试数据库
```

- `npm run dev` — 读 `.env.dev`（若无则 `.env`）
- `npm run dev:test` — 读 `.env.test`

### 部署（测试 / 生产）

在平台 Secret 中注入 `APP_ENV` 和 `DATABASE_URL`，无需任何文件：

| 环境 | `APP_ENV` | `NODE_ENV`    |
| ---- | --------- | ------------- |
| 开发 | `dev`     | `development` |
| 测试 | `test`    | `test`        |
| 生产 | `prod`    | `production`  |

所有 `.env` 和 `.env.*` 文件均被 `.gitignore` 忽略，避免密钥进入 Git。
