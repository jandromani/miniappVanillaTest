import { Tournament } from "./tournaments";
import { updateState, loadState } from "./storage";

type PrizePoolSnapshot = {
  tournamentId: string;
  prizePool: number;
  rakePercent: number;
  rakeAmount: number;
  totalPaid: number;
  payload: Record<string, unknown>;
  syncedAt: number;
};

const loadSnapshots = (): PrizePoolSnapshot[] => {
  const state = loadState();
  return (state as any).prizePoolSnapshots ?? [];
};

const persistSnapshots = (snapshots: PrizePoolSnapshot[]) => {
  updateState({ prizePoolSnapshots: snapshots as any });
};

export const syncPrizePoolWithOnChain = (
  tournament: Tournament,
  prizePool: number,
  rakeAmount: number,
  totalPaid: number
) => {
  const snapshots = loadSnapshots();
  const payload = {
    contract: process.env.WORLDCHAIN_CONTRACT_ADDRESS ?? "0xmock",
    entryToken: "WLD",
    tournamentId: tournament.id,
    prizePool,
    rakeAmount,
    totalPaid,
    rakePercent: tournament.rakePercent,
  };

  const snapshot: PrizePoolSnapshot = {
    tournamentId: tournament.id,
    prizePool,
    rakePercent: tournament.rakePercent,
    rakeAmount,
    totalPaid,
    payload,
    syncedAt: Date.now(),
  };

  snapshots.push(snapshot);
  persistSnapshots(snapshots);
  return snapshot;
};
