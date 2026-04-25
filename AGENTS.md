# AGENTS.md

## Repo shape

- Minimal ESM TypeScript + Prisma PostgreSQL scaffold; `src/index.ts` only registers process handlers and logs startup, with no HTTP server or routing yet.
- `tsconfig.json` includes only `src/**/*.ts`; add new compiled TypeScript under `src/` or update the config.
- Build output mirrors the repo root because `rootDir` is `.`; runtime entry is `dist/src/index.js`.

## Commands

- Use npm/package-lock: `npm install`, then `npm run prisma:generate` before type/build work if `generated/prisma` is missing or schema changed.
- Available verification: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`.
- There is no test runner or `npm test` script. For future DB tests, prefix with `cross-env APP_ENV=test` and run `npm run prisma:migrate:test` first.

## Env and Prisma gotchas

- App env loading lives in `src/config/env.ts`; importing `env` validates `APP_ENV`, `NODE_ENV`, and `DATABASE_URL` immediately with Zod.
- Prisma CLI env loading is duplicated in `prisma.config.ts`; it does not go through app code. Both load `.env.{APP_ENV}` first then `.env` as fallback, with `override: false`.
- `APP_ENV` defaults to `dev` and maps to `NODE_ENV` (`dev→development`, `test→test`, `prod→production`); existing `process.env` values win over `.env` file values.
- Treat all `.env*` files as secrets; `.gitignore` covers `.env` and `.env.*`.
- `prisma/schema.prisma` intentionally has no datasource `url`; Prisma v7 reads `DATABASE_URL` from `prisma.config.ts`.
- `src/lib/prisma.ts` imports the generated client from `../../generated/prisma/client` and uses `@prisma/adapter-pg`; do not switch to the legacy Prisma connection style without changing that wiring.

## Generated and style constraints

- Do not edit `generated/prisma/` or `dist/`; regenerate with `npm run prisma:generate` or rebuild with `npm run build`.
- ESLint ignores generated/build output and enforces `@typescript-eslint/consistent-type-imports`; use `import type` for type-only imports.
