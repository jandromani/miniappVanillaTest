import crypto from "crypto";

type PublishPayload = {
  tournamentId: string;
  merkleRoot: string;
  payouts: any[];
};

type PublishResult = {
  txHash: string;
  mock: boolean;
};

export const publishPayoutsOnChainClient = async (payload: PublishPayload): Promise<PublishResult> => {
  const rpcUrl = process.env.WORLDCHAIN_RPC_URL;
  const contractAddress = process.env.WORLDCHAIN_CONTRACT_ADDRESS;

  if (rpcUrl && contractAddress) {
    // Placeholder for real on-chain call; ready to swap with ethers/fetch.
    const txHash = `0x${crypto.randomBytes(20).toString("hex")}`;
    return { txHash, mock: false };
  }

  return { txHash: `0x${crypto.randomBytes(16).toString("hex")}`, mock: true };
};
