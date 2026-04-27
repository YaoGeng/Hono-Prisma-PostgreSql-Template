import { Hono } from "hono";
import type { Context } from "hono";
import { sign } from "hono/utils/jwt/jwt";
import bcrypt from "bcryptjs";
import { createHash, randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { registerSchema, loginSchema, refreshSchema } from "./auth.schemas";
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function generateAccessToken(user: { id: string; email: string }): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 15 * 60;
  return sign({ sub: user.id, email: user.email, exp }, env.JWT_SECRET);
}

function generateRefreshTokenString(): string {
  return randomUUID() + "-" + randomUUID();
}

function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

const registerHandler = async (c: Context) => {
  const parseResult = registerSchema.safeParse(await c.req.json());
  if (!parseResult.success) {
    return c.json({ error: "Invalid input" }, 400);
  }

  const body = parseResult.data;

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return c.json({ error: "Email already registered" }, 409);
  }

  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: { email: body.email, passwordHash },
  });

  const accessToken = await generateAccessToken(user);
  const refreshToken = generateRefreshTokenString();
  const tokenHash = hashRefreshToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    },
  });

  return c.json({ accessToken, refreshToken }, 201);
};

const loginHandler = async (c: Context) => {
  const parseResult = loginSchema.safeParse(await c.req.json());
  if (!parseResult.success) {
    return c.json({ error: "Invalid input" }, 400);
  }

  const body = parseResult.data;
  const user = await prisma.user.findUnique({ where: { email: body.email } });

  if (!user) {
    await bcrypt.compare(body.password, "$2a$10$dummyHashForTiming");
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const accessToken = await generateAccessToken(user);
  const refreshToken = generateRefreshTokenString();
  const tokenHash = hashRefreshToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    },
  });

  return c.json({ accessToken, refreshToken }, 200);
};

const refreshHandler = async (c: Context) => {
  const parseResult = refreshSchema.safeParse(await c.req.json());
  if (!parseResult.success) {
    return c.json({ error: "Invalid input" }, 400);
  }

  const body = parseResult.data;
  const tokenHash = hashRefreshToken(body.refreshToken);

  const storedToken = await prisma.refreshToken.findFirst({
    where: { tokenHash, expiresAt: { gt: new Date() } },
  });

  if (!storedToken) {
    return c.json({ error: "Invalid or expired refresh token" }, 401);
  }

  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const user = await prisma.user.findUnique({ where: { id: storedToken.userId } });
  if (!user) {
    return c.json({ error: "Invalid or expired refresh token" }, 401);
  }

  const accessToken = await generateAccessToken(user);
  const refreshToken = generateRefreshTokenString();
  const newTokenHash = hashRefreshToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash: newTokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    },
  });

  return c.json({ accessToken, refreshToken }, 200);
};

const meHandler = async (c: Context) => {
  const jwtPayload = c.get("jwtPayload") as { sub: string; email: string; exp: number };
  const user = await prisma.user.findUnique({ where: { id: jwtPayload.sub } });

  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }

  return c.json({ id: user.id, email: user.email, createdAt: user.createdAt }, 200);
};

const authRoutes = new Hono();
authRoutes.post("/register", registerHandler);
authRoutes.post("/login", loginHandler);
authRoutes.post("/refresh", refreshHandler);

export { authRoutes, meHandler };
