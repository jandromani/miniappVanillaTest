import crypto from "crypto";
import { updateState, loadState } from "./storage";
import { LeaderboardEntry } from "./tournaments";

type MerkleRecord = {
  tournamentId: string;
  merkleRoot: string;
  payouts: any[];
  txHash?: string;
  publishedAt: number;
};

const loadMerkleRecords = (): MerkleRecord[] => {
  const state = loadState();
  return (state as any).merkleRecords ?? [];
};

const persistMerkleRecords = (records: MerkleRecord[]) => {
  updateState({ merkleRecords: records as any });
};

export const buildMerkleRootForTournament = (leaderboard: LeaderboardEntry[]) => {
  const serialized = JSON.stringify(leaderboard);
  return crypto.createHash("sha256").update(serialized).digest("hex");
};

export const preparePayoutPayloads = (leaderboard: LeaderboardEntry[], prizePool: number, splits: number[]) => {
  return leaderboard.slice(0, splits.length).map((entry, idx) => ({
    wallet: entry.wallet,
    amount: Math.round(prizePool * splits[idx] * 100) / 100,
    position: idx + 1,
  }));
};

export const publishPayoutsOnChain = (
  tournamentId: string,
  merkleRoot: string,
  payouts: any[],
  txHash?: string
) => {
  const records = loadMerkleRecords();
  const record: MerkleRecord = {
    tournamentId,
    merkleRoot,
    payouts,
    txHash: txHash ?? `0x${crypto.randomBytes(16).toString("hex")}`,
    publishedAt: Date.now(),
  };
  records.push(record);
  persistMerkleRecords(records);
  return record;
};
