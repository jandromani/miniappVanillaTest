import fetch from "node-fetch";

type VerificationResult = {
  ok: boolean;
  transaction?: any;
  reason?: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const verifyWorldcoinTransaction = async (
  reference: string,
  transactionId: string,
  attempts = 3
): Promise<VerificationResult> => {
  const appId = process.env.APP_ID;
  const apiKey = process.env.DEV_PORTAL_API_KEY;

  if (!appId || !apiKey) {
    return { ok: true, reason: "mock_mode" };
  }

  let lastReason: string | undefined;
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(
        `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${appId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        lastReason = `upstream_${response.status}`;
        await delay(250 * (i + 1));
        continue;
      }

      const transaction = (await response.json()) as any;
      if (transaction.reference === reference && transaction.status === "success") {
        return { ok: true, transaction };
      }

      lastReason = "reference_mismatch_or_failed";
    } catch (error: any) {
      lastReason = error?.message ?? "unknown_error";
      await delay(250 * (i + 1));
    }
  }

  return { ok: false, reason: lastReason };
};
