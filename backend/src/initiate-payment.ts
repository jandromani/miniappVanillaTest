import { RequestHandler } from "express";
import crypto from "crypto";
import { createPaymentReference } from "./payment-store";
import { getTournament, hasTournamentEntryForWorldId } from "./tournaments";
import { AuthedRequest } from "./auth";
import { buildPayloadBase, signPayloadBase } from "./api-signature";
import { hasJoinedTournament } from "./worldid-store";

export const initiatePaymentHandler: RequestHandler = (req, res) => {
  const uuid = crypto.randomUUID().replace(/-/g, "");
  const { tournamentId } = req.body as { tournamentId?: string };
  const user = (req as AuthedRequest).user;

  if (!user) {
    res.status(401).json({ ok: false, reason: "unauthorized" });
    return;
  }

  if (!tournamentId) {
    res.status(400).json({ ok: false, reason: "missing_tournament" });
    return;
  }

  const tournament = tournamentId ? getTournament(tournamentId) : undefined;
  if (!tournament) {
    res.status(404).json({ ok: false, reason: "unknown_tournament" });
    return;
  }

  if (!user.worldId) {
    res.status(400).json({ ok: false, reason: "world_id_required" });
    return;
  }

  if (hasTournamentEntryForWorldId(tournamentId, user.worldId) || hasJoinedTournament(user.worldId, tournamentId)) {
    res.status(409).json({ ok: false, reason: "already_joined" });
    return;
  }

  const amount = tournament.entryFee;
  const token = "WLD" as const;
  const toAddress = process.env.TREASURY_ADDRESS ?? "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";
  const payloadBase = buildPayloadBase({
    tournamentId,
    wallet: user.wallet,
    amount,
    symbol: token,
    to: toAddress,
  });
  const signature = signPayloadBase(payloadBase);

  const record = createPaymentReference({
    reference: uuid,
    userId: user.wallet,
    worldId: user.worldId,
    wallet: user.wallet,
    tournamentId,
    token,
    amount,
    to: toAddress,
    signature,
  });

  res.json({
    id: uuid,
    record,
    payloadBase,
    signature,
    token,
    amount,
    to: toAddress,
  });
};
