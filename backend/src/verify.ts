import {
  verifyCloudProof,
  IVerifyResponse,
  ISuccessResult,
} from "@worldcoin/minikit-js";
import { RequestHandler } from "express";
import { issueSessionToken } from "./auth";
import { hasProofBeenUsed, isWalletBoundToWorldId, recordWorldIdVerification } from "./worldid-store";

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal: string | undefined;
  wallet?: string;
}

export const verifyHandler: RequestHandler = async (req, res) => {
  const { payload, action, signal, wallet } = req.body as IRequestPayload;
  const app_id = process.env.APP_ID as `app_${string}` | undefined;
  const expectedAction = process.env.WORLD_ID_ACTION ?? "join-tournament";
  const expectedSignal = process.env.WORLD_ID_SIGNAL;
  const worldWallet = wallet || "";
  const worldId = payload?.nullifier_hash;

  if (!worldWallet) {
    res.status(400).json({ ok: false, reason: "wallet_required" });
    return;
  }

  if (!worldId) {
    res.status(400).json({ ok: false, reason: "missing_world_id" });
    return;
  }

  if (expectedAction && action !== expectedAction) {
    res.status(400).json({ ok: false, reason: "action_mismatch" });
    return;
  }

  if (expectedSignal && signal !== expectedSignal) {
    res.status(400).json({ ok: false, reason: "signal_mismatch" });
    return;
  }

  if (hasProofBeenUsed(worldId, expectedAction)) {
    res.status(409).json({ ok: false, reason: "proof_reused" });
    return;
  }

  if (!isWalletBoundToWorldId(worldId, worldWallet)) {
    res.status(409).json({ ok: false, reason: "wallet_worldid_mismatch" });
    return;
  }

  if (!app_id) {
    if (process.env.NODE_ENV === "production") {
      res.status(400).json({ ok: false, reason: "world_id_not_configured" });
      return;
    }
    const token = issueSessionToken(worldWallet, worldId);
    recordWorldIdVerification(worldId, worldWallet, expectedAction, expectedSignal);
    res.status(200).json({ ok: true, verifyRes: { success: true, mock: true }, token, wallet: worldWallet });
    return;
  }

  const verifyRes = (await verifyCloudProof(payload, app_id, expectedAction, expectedSignal)) as IVerifyResponse;

  if (verifyRes.success) {
    const token = issueSessionToken(worldWallet, worldId);
    recordWorldIdVerification(worldId, worldWallet, expectedAction, expectedSignal);
    res.status(200).json({ ok: true, verifyRes, token, wallet: worldWallet });
    return;
  }

  res.status(400).json({ ok: false, verifyRes });
};
