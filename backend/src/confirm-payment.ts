import { MiniAppPaymentSuccessPayload } from "@worldcoin/minikit-js";
import { RequestHandler } from "express";
import { getPayment, updatePaymentStatus } from "./payment-store";
import { addTournamentEntry, getTournament, hasTournamentEntryForWorldId } from "./tournaments";
import { verifyWorldcoinTransaction } from "./worldcoin-client";
import { AuthedRequest } from "./auth";
import { verifyPayloadSignature, buildPayloadBase } from "./api-signature";
import { logWorldcoinVerification } from "./worldcoin-tx-store";
import { hasJoinedTournament, markTournamentParticipation } from "./worldid-store";

interface IRequestPayload {
  payload: MiniAppPaymentSuccessPayload;
  signature?: string;
}

export const confirmPaymentHandler: RequestHandler = async (req, res) => {
  const { payload, signature } = req.body as IRequestPayload;
  const reference = payload?.reference;
  const user = (req as AuthedRequest).user;

  if (!user) {
    res.status(401).json({ success: false, reason: "unauthorized" });
    return;
  }

  if (!user.worldId) {
    res.status(400).json({ success: false, reason: "world_id_required" });
    return;
  }

  if (!reference) {
    res.status(400).json({ success: false, reason: "missing_reference" });
    return;
  }

  const existing = getPayment(reference);
  if (!existing) {
    res.status(404).json({ success: false, reason: "unknown_reference" });
    return;
  }

  if (existing.wallet && existing.wallet !== user.wallet) {
    res.status(403).json({ success: false, reason: "wallet_mismatch" });
    return;
  }

  const payloadBase = buildPayloadBase({
    tournamentId: existing.tournamentId ?? "",
    wallet: user.wallet,
    amount: existing.amount,
    symbol: existing.token,
    to: existing.to,
  });

  if (!verifyPayloadSignature(payloadBase, signature ?? existing.signature)) {
    res.status(400).json({ success: false, reason: "invalid_signature" });
    return;
  }

  const existingStatus = existing.status;
  if (existingStatus === "confirmed") {
    res.json({ success: true, reference, record: existing, mode: "idempotent" });
    return;
  }

  const tournament = existing.tournamentId ? getTournament(existing.tournamentId) : undefined;
  if (!tournament) {
    res.status(404).json({ success: false, reason: "tournament_not_found" });
    return;
  }

  if (hasTournamentEntryForWorldId(existing.tournamentId!, user.worldId) || hasJoinedTournament(user.worldId, existing.tournamentId!)) {
    res.status(409).json({ success: false, reason: "already_joined" });
    return;
  }

  const verification = await verifyWorldcoinTransaction(reference, payload.transaction_id, {
    amount: tournament.entryFee,
    symbol: existing.token,
    to: existing.to,
  });

  if (verification.reason === "mock_mode" && process.env.NODE_ENV === "production") {
    res.status(400).json({ success: false, reference, reason: "mock_disallowed" });
    return;
  }

  logWorldcoinVerification({
    reference,
    txId: payload.transaction_id,
    ok: verification.ok,
    reason: verification.reason,
    transaction: verification.transaction,
  });

  if (verification.ok) {
    const updated = updatePaymentStatus(reference, "confirmed", payload.transaction_id);
    if (existing.tournamentId) {
      addTournamentEntry(existing.tournamentId, {
        reference,
        userId: user.worldId,
        worldId: user.worldId,
        token: existing.token,
        amount: existing.amount,
        transactionId: payload.transaction_id,
        wallet: user.wallet,
      });
      markTournamentParticipation(user.worldId, existing.tournamentId);
    }
    res.json({ success: true, reference, record: updated, transaction: verification.transaction, mode: verification.reason });
    return;
  }

  updatePaymentStatus(reference, "failed", payload.transaction_id);
  res.status(400).json({ success: false, reference, reason: verification.reason, transaction: verification.transaction });
};
