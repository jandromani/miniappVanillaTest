import crypto from "crypto";

const API_HMAC_SECRET = process.env.API_HMAC_SECRET ?? "dev-api-secret";

export const buildPayloadBase = (payload: {
  tournamentId: string;
  wallet: string;
  amount: number;
  symbol: string;
  to: string;
}) => `${payload.tournamentId}:${payload.wallet}:${payload.amount}:${payload.symbol}:${payload.to}`;

export const signPayloadBase = (payloadBase: string) =>
  crypto.createHmac("sha256", API_HMAC_SECRET).update(payloadBase).digest("hex");

export const verifyPayloadSignature = (payloadBase: string, signature?: string) => {
  if (!signature) return false;
  const expected = signPayloadBase(payloadBase);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
};
