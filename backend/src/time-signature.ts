import crypto from "crypto";

const DEFAULT_SECRET = "dev-time-secret";

export const timeSignatureSecret = () => process.env.TIME_HMAC_SECRET || DEFAULT_SECRET;

export const signPayload = (payload: object) => {
  const secret = timeSignatureSecret();
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest("hex");
};

export const verifySignature = (payload: object, signature?: string) => {
  if (!signature) return false;
  const expected = signPayload(payload);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};
