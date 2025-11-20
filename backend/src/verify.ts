import {
  verifyCloudProof,
  IVerifyResponse,
  ISuccessResult,
} from "@worldcoin/minikit-js";
import { RequestHandler } from "express";
import { issueSessionToken } from "./auth";

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal: string | undefined;
  wallet?: string;
}

export const verifyHandler: RequestHandler = async (req, res) => {
  const { payload, action, signal, wallet } = req.body as IRequestPayload;
  const app_id = process.env.APP_ID as `app_${string}` | undefined;

  const worldWallet = wallet || "anon-wallet";

  if (!app_id) {
    const token = issueSessionToken(worldWallet, payload?.nullifier_hash ?? "dev-world-id");
    res.status(200).json({ ok: true, verifyRes: { success: true, mock: true }, token, wallet: worldWallet });
    return;
  }

  const verifyRes = (await verifyCloudProof(payload, app_id, action, signal)) as IVerifyResponse;

  if (verifyRes.success) {
    const token = issueSessionToken(worldWallet, payload?.nullifier_hash);
    res.status(200).json({ ok: true, verifyRes, token, wallet: worldWallet });
    return;
  }

  res.status(400).json({ ok: false, verifyRes });
};
