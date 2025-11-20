import { MiniAppPaymentSuccessPayload } from "@worldcoin/minikit-js";
import { RequestHandler } from "express";
import { getPayment, updatePaymentStatus } from "./payment-store";
import { addTournamentEntry } from "./tournaments";
import { verifyWorldcoinTransaction } from "./worldcoin-client";

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

  const existingStatus = existing.status;
  if (existingStatus === "confirmed") {
    res.json({ success: true, reference, record: existing, mode: "idempotent" });
    return;
  }

  const verification = await verifyWorldcoinTransaction(reference, payload.transaction_id);

  if (verification.ok) {
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
    res.json({ success: true, reference, record: updated, transaction: verification.transaction, mode: verification.reason });
    return;
  }

  updatePaymentStatus(reference, "failed", payload.transaction_id);
  res.status(400).json({ success: false, reference, reason: verification.reason, transaction: verification.transaction });
};
