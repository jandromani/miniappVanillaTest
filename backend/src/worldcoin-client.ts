import fetch from "node-fetch";

type VerificationResult = {
  ok: boolean;
  transaction?: any;
  reason?: string;
};

interface VerificationExpectation {
  amount: number;
  symbol: string;
  to: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const verifyWorldcoinTransaction = async (
  reference: string,
  transactionId: string,
  expectation: VerificationExpectation,
  attempts = 3
): Promise<VerificationResult> => {
  const appId = process.env.APP_ID;
  const apiKey = process.env.DEV_PORTAL_API_KEY;

  if ((!appId || !apiKey) && process.env.NODE_ENV === "production") {
    return { ok: false, reason: "missing_credentials" };
  }

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
      const matchesReference = transaction.reference === reference;
      const matchesStatus = transaction.status === "success";
      const matchesSymbol = transaction.tokens?.[0]?.symbol === expectation.symbol;
      const matchesAmount = Number(transaction.tokens?.[0]?.token_amount ?? 0) === expectation.amount;
      const matchesTo = transaction.to === expectation.to;

      if (matchesReference && matchesStatus && matchesSymbol && matchesAmount && matchesTo) {
        return { ok: true, transaction };
      }

      const mismatches = [];
      if (!matchesReference) mismatches.push("reference");
      if (!matchesStatus) mismatches.push("status");
      if (!matchesSymbol) mismatches.push("symbol");
      if (!matchesAmount) mismatches.push("amount");
      if (!matchesTo) mismatches.push("to");
      lastReason = `mismatch_${mismatches.join("_")}`;
    } catch (error: any) {
      lastReason = error?.message ?? "unknown_error";
      await delay(250 * (i + 1));
    }
  }

  return { ok: false, reason: lastReason };
};
