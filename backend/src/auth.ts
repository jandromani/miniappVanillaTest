import crypto from "crypto";
import { RequestHandler } from "express";

type AuthPayload = {
  wallet: string;
  worldId: string;
  issuedAt: number;
  exp: number;
};

const AUTH_SECRET = process.env.AUTH_HMAC_SECRET ?? "dev-auth-secret";

const signPayload = (payload: AuthPayload) => {
  const serialized = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(serialized).digest("hex");
  const token = `${Buffer.from(serialized).toString("base64url")}.${signature}`;
  return token;
};

const verifyTokenInternal = (token?: string): AuthPayload | undefined => {
  if (!token) return undefined;
  const parts = token.split(".");
  if (parts.length !== 2) return undefined;
  const [encoded, signature] = parts;
  try {
    const serialized = Buffer.from(encoded, "base64url").toString("utf8");
    const expected = crypto.createHmac("sha256", AUTH_SECRET).update(serialized).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return undefined;
    const parsed = JSON.parse(serialized) as AuthPayload;
    if (parsed.exp && parsed.exp < Date.now()) return undefined;
    if (process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "development" && !parsed.worldId) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
};

export const issueSessionToken = (wallet: string, worldId: string) => {
  const issuedAt = Date.now();
  const payload: AuthPayload = { wallet, worldId, issuedAt, exp: issuedAt + 30 * 60 * 1000 };
  return signPayload(payload);
};

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
  const payload = verifyTokenInternal(token);
  if (!payload) {
    res.status(401).json({ ok: false, reason: "unauthorized" });
    return;
  }
  (req as any).user = payload;
  next();
};

export type AuthedRequest = {
  user?: AuthPayload;
};
