import { RequestHandler } from "express";
import crypto from "crypto";
import { createPaymentReference } from "./payment-store";

export const initiatePaymentHandler: RequestHandler = (req, res) => {
  const uuid = crypto.randomUUID().replace(/-/g, "");
  const { userId, tournamentId, token = "WLD", amount } = req.body as {
    userId?: string;
    tournamentId?: string;
    token?: "WLD" | "USDC";
    amount?: number;
  };

  const record = createPaymentReference({
    reference: uuid,
    userId,
    tournamentId,
    token: token ?? "WLD",
    amount: amount ?? 0,
  });

  res.json({ id: uuid, record });
};
