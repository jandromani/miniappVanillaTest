import { loadState, updateState } from "./storage";

export type WorldIdRecord = {
  worldId: string;
  wallets: string[];
  lastVerifiedAt: number;
  joinedTournaments: string[];
};

export type WorldIdProofLog = {
  worldId: string;
  action: string;
  signal?: string;
  usedAt: number;
};

const bootstrapRecords = () => {
  const state = loadState();
  return (state.worldIdRecords as WorldIdRecord[]) ?? [];
};

const bootstrapProofs = () => {
  const state = loadState();
  return (state.worldIdProofs as WorldIdProofLog[]) ?? [];
};

const records: WorldIdRecord[] = bootstrapRecords();
const proofs: WorldIdProofLog[] = bootstrapProofs();

const persist = () => updateState({ worldIdRecords: records as any, worldIdProofs: proofs as any });

export const recordWorldIdVerification = (worldId: string, wallet: string, action: string, signal?: string) => {
  const existing = records.find((r) => r.worldId === worldId);
  if (existing) {
    if (!existing.wallets.includes(wallet)) {
      existing.wallets.push(wallet);
    }
    existing.lastVerifiedAt = Date.now();
  } else {
    records.push({ worldId, wallets: [wallet], lastVerifiedAt: Date.now(), joinedTournaments: [] });
  }

  proofs.push({ worldId, action, signal, usedAt: Date.now() });
  persist();
};

export const hasProofBeenUsed = (worldId: string, action: string) =>
  proofs.some((p) => p.worldId === worldId && p.action === action);

export const isWalletBoundToWorldId = (worldId: string, wallet: string) => {
  const existing = records.find((r) => r.worldId === worldId);
  if (!existing) return true;
  return existing.wallets.includes(wallet);
};

export const markTournamentParticipation = (worldId: string, tournamentId: string) => {
  const existing = records.find((r) => r.worldId === worldId);
  if (existing) {
    if (!existing.joinedTournaments.includes(tournamentId)) existing.joinedTournaments.push(tournamentId);
  } else {
    records.push({ worldId, wallets: [], lastVerifiedAt: Date.now(), joinedTournaments: [tournamentId] });
  }
  persist();
};

export const hasJoinedTournament = (worldId: string, tournamentId: string) =>
  records.some((r) => r.worldId === worldId && r.joinedTournaments.includes(tournamentId));

export const listWorldIdRecords = () => records;
export const listProofLogs = () => proofs;
