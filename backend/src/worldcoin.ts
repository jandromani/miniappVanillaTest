import fetch from "node-fetch";

export interface WorldcoinVerification {
  ok: boolean;
  transaction?: any;
  reason?: string;
}

export const verifyWorldcoinTransaction = async (
  reference: string,
  transactionId: string
): Promise<WorldcoinVerification> => {
  if (!process.env.APP_ID || !process.env.DEV_PORTAL_API_KEY) {
    return { ok: true, reason: "mock_mode" };
  }

  try {
    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${process.env.APP_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return { ok: false, reason: `upstream_${response.status}` };
    }

    const transaction = (await response.json()) as any;
    if (transaction.reference === reference && transaction.status !== "failed") {
      return { ok: true, transaction };
    }

    return { ok: false, transaction, reason: "reference_mismatch_or_failed" };
  } catch (error: any) {
    return { ok: false, reason: error?.message ?? "unknown_error" };
  }
};
