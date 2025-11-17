import fetch from "node-fetch";
import { MiniAppPaymentSuccessPayload } from "@worldcoin/minikit-js";
import { RequestHandler } from "express";
import { getPayment, updatePaymentStatus } from "./payment-store";
import { addTournamentEntry } from "./tournaments";

interface IRequestPayload {
  payload: MiniAppPaymentSuccessPayload;
}

export const confirmPaymentHandler: RequestHandler = async (req, res) => {
  const { payload } = req.body as IRequestPayload;
  const reference = payload?.reference;

  if (!reference) {
    res.status(400).json({ success: false, reason: "missing_reference" });
    return;
  }

  const existing = getPayment(reference);
  if (!existing) {
    res.status(404).json({ success: false, reason: "unknown_reference" });
    return;
  }

  // When running locally without app credentials, treat confirmation as a mocked success
  if (!process.env.APP_ID || !process.env.DEV_PORTAL_API_KEY) {
    const updated = updatePaymentStatus(reference, "confirmed", payload.transaction_id);
    if (existing.tournamentId) {
      addTournamentEntry(existing.tournamentId, {
        reference,
        userId: existing.userId,
        token: existing.token,
        amount: existing.amount,
        transactionId: payload.transaction_id,
      });
    }
    res.json({ success: true, reference, record: updated, mode: "mock" });
    return;
  }

  const response = await fetch(
    `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${process.env.APP_ID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
      },
    }
  );

  const transaction = (await response.json()) as any;

  if (transaction.reference == reference && transaction.status !== "failed") {
    const updated = updatePaymentStatus(reference, "confirmed", payload.transaction_id);
    if (existing.tournamentId) {
      addTournamentEntry(existing.tournamentId, {
        reference,
        userId: existing.userId,
        token: existing.token,
        amount: existing.amount,
        transactionId: payload.transaction_id,
      });
    }
    res.json({ success: true, reference, record: updated, transaction });
    return;
  }

  updatePaymentStatus(reference, "failed", payload.transaction_id);
  res.status(400).json({ success: false, reference, transaction });
};
