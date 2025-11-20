import crypto from "crypto";
import { loadState, updateState } from "./storage";
import { syncPrizePoolWithOnChain } from "./worldchain-prizepool";
import { buildMerkleRootForTournament, preparePayoutPayloads, publishPayoutsOnChain } from "./worldchain-merkle";

export type TournamentStatus = "open" | "active" | "finished";

export interface LeaderboardEntry {
  userId: string;
  wallet: string;
  correct: number;
  timeMs: number;
}

export interface TournamentEntry {
  reference: string;
  userId?: string;
  amount: number;
  token: "WLD" | "USDC";
  transactionId?: string;
  createdAt: number;
}

export interface AnswerLog {
  wallet: string;
  questionNumber: number;
  correct: boolean;
  answerTime: number;
  answeredAt: number;
  gameId: string;
  nonce: string;
}

export interface PayoutRecord {
  position: number;
  userId: string;
  amount: number;
  transactionHash: string;
}

export interface Tournament {
  id: string;
  name: string;
  status: TournamentStatus;
  entryFee: number;
  basePrizePool: number;
  rakePercent: number;
  endsAt: number;
  players: number;
  entries: TournamentEntry[];
  leaderboard: LeaderboardEntry[];
  payouts: PayoutRecord[];
  payoutTxHash?: string;
  merkleRoot?: string;
  responses: AnswerLog[];
}

const defaultTournaments: Tournament[] = [
  {
    id: "1",
    name: "Grand Slam #53",
    status: "open",
    entryFee: 0.25,
    basePrizePool: 343.5,
    rakePercent: 0.1,
    endsAt: Date.now() + 1000 * 60 * 30,
    players: 128,
    entries: [],
    responses: [],
    leaderboard: [
      { userId: "user-1", wallet: "0xamsoryf...9495", correct: 14, timeMs: 8200 },
      { userId: "user-2", wallet: "0xkatana...7721", correct: 13, timeMs: 9100 },
      { userId: "user-3", wallet: "0xakira...1042", correct: 12, timeMs: 9600 },
      { userId: "user-8", wallet: "0xbravo...1199", correct: 10, timeMs: 11800 },
      { userId: "user-16", wallet: "0xmecha...3300", correct: 9, timeMs: 14100 },
    ],
    payouts: [],
  },
  {
    id: "2",
    name: "Grand Slam #54",
    status: "open",
    entryFee: 1,
    basePrizePool: 512.75,
    rakePercent: 0.1,
    endsAt: Date.now() + 1000 * 60 * 15,
    players: 96,
    entries: [],
    responses: [],
    leaderboard: [],
    payouts: [],
  },
  {
    id: "3",
    name: "Gran Final #52",
    status: "active",
    entryFee: 0.5,
    basePrizePool: 890.15,
    rakePercent: 0.1,
    endsAt: Date.now() + 1000 * 60 * 10,
    players: 180,
    entries: [],
    responses: [],
    leaderboard: [],
    payouts: [],
  },
];

const bootstrapTournaments = (): Tournament[] => {
  const state = loadState();
  if (state.tournaments && state.tournaments.length) {
    return state.tournaments as Tournament[];
  }
  return defaultTournaments;
};

const persist = (items: Tournament[]) => {
  updateState({ tournaments: items });
};

const tournaments: Tournament[] = bootstrapTournaments();

const payoutSplits = [0.5, 0.3, 0.2];

const buildLeaderboardFromResponses = (responses: AnswerLog[]): LeaderboardEntry[] => {
  const aggregates = new Map<string, { correct: number; timeMs: number }>();
  responses.forEach((resp) => {
    const current = aggregates.get(resp.wallet) ?? { correct: 0, timeMs: 0 };
    aggregates.set(resp.wallet, {
      correct: current.correct + (resp.correct ? 1 : 0),
      timeMs: current.timeMs + resp.answerTime,
    });
  });

  return Array.from(aggregates.entries()).map(([wallet, stats]) => ({
    userId: wallet,
    wallet,
    correct: stats.correct,
    timeMs: stats.timeMs,
  }));
};

const computeFinancials = (tournament: Tournament) => {
  const totalPaid = tournament.entries.reduce((sum, entry) => sum + entry.amount, 0);
  const rakeAmount = Math.round(totalPaid * tournament.rakePercent * 100) / 100;
  const prizePool = Math.round((tournament.basePrizePool + (totalPaid - rakeAmount)) * 100) / 100;
  return { totalPaid, rakeAmount, prizePool };
};

export const listTournaments = () =>
  tournaments.map((tournament) => {
    const { prizePool, rakeAmount } = computeFinancials(tournament);
    return {
      ...tournament,
      prizePool,
      rakeAmount,
    };
  });

export const getTournament = (id: string) => listTournaments().find((t) => t.id === id);

export const addTournamentEntry = (id: string, entry: Omit<TournamentEntry, "createdAt">) => {
  const tournament = tournaments.find((t) => t.id === id);
  if (!tournament) return undefined;
  tournament.entries.push({ ...entry, createdAt: Date.now() });
  tournament.players = Math.max(tournament.players, tournament.entries.length);
  persist(tournaments);
  return getTournament(id);
};

export const recordTournamentAnswer = (
  id: string,
  log: Omit<AnswerLog, "answeredAt"> & { answeredAt?: number }
) => {
  const tournament = tournaments.find((t) => t.id === id);
  if (!tournament) return undefined;
  const answeredAt = log.answeredAt ?? Date.now();
  tournament.responses.push({ ...log, answeredAt });
  tournament.leaderboard = buildLeaderboardFromResponses(tournament.responses);
  persist(tournaments);
  return tournament;
};

export const getLeaderboard = (id: string) => {
  const tournament = tournaments.find((t) => t.id === id);
  if (!tournament) return undefined;
  const { prizePool } = computeFinancials(tournament);
  const baseLeaderboard =
    tournament.responses.length > 0
      ? buildLeaderboardFromResponses(tournament.responses)
      : tournament.leaderboard;
  const sorted = [...baseLeaderboard].sort((a, b) => {
    if (a.correct !== b.correct) return b.correct - a.correct;
    return a.timeMs - b.timeMs;
  });
  return sorted.map((entry, index) => ({
    position: index + 1,
    reward: index < payoutSplits.length ? Math.round(prizePool * payoutSplits[index] * 100) / 100 : 0,
    ...entry,
  }));
};

export const finalizeTournament = (id: string) => {
  const tournament = tournaments.find((t) => t.id === id);
  if (!tournament || tournament.status === "finished") return undefined;
  const { prizePool, rakeAmount, totalPaid } = computeFinancials(tournament);
  const leaderboard = getLeaderboard(id) ?? [];
  const payoutsPayload = preparePayoutPayloads(leaderboard, prizePool, payoutSplits);
  const payouts: PayoutRecord[] = payoutsPayload.map((payload) => ({
    position: payload.position,
    userId: payload.wallet,
    amount: payload.amount,
    transactionHash: `0x${crypto.randomBytes(16).toString("hex")}`,
  }));

  const merkleRoot = buildMerkleRootForTournament(leaderboard);
  const payoutTxHash = publishPayoutsOnChain(id, merkleRoot, payoutsPayload).txHash;
  syncPrizePoolWithOnChain(tournament, prizePool, rakeAmount, totalPaid);

  tournament.status = "finished";
  tournament.payouts = payouts;
  tournament.merkleRoot = merkleRoot;
  tournament.payoutTxHash = payoutTxHash;
  persist(tournaments);

  return {
    ...tournament,
    prizePool,
    rakeAmount,
  };
};

export const processDuePayouts = () => {
  const now = Date.now();
  const processed: Tournament[] = [];
  tournaments
    .filter((t) => t.status !== "finished" && t.endsAt <= now)
    .forEach((tournament) => {
      const finalized = finalizeTournament(tournament.id);
      if (finalized) processed.push(finalized as Tournament);
    });
  return processed;
};

export const getUserHistory = (wallet: string) => {
  const participated = tournaments.filter((t) =>
    t.entries.some((entry) => entry.userId === wallet)
  );
  const wins = participated.filter((t) =>
    t.payouts.some((p) => p.userId === wallet)
  );
  const answered = tournaments.filter((t) => t.responses.some((r) => r.wallet === wallet));
  const totalEarned = wins.reduce((sum, t) => sum + (t.payouts.find((p) => p.userId === wallet)?.amount ?? 0), 0);
  const totalAnswered = answered.reduce((sum, t) => sum + t.responses.filter((r) => r.wallet === wallet).length, 0);
  const totalCorrect = answered.reduce(
    (sum, t) => sum + t.responses.filter((r) => r.wallet === wallet && r.correct).length,
    0
  );

  return {
    wallet,
    played: participated.map((t) => ({ id: t.id, name: t.name, status: t.status })),
    wins: wins.map((t) => ({ id: t.id, name: t.name, payout: t.payouts.find((p) => p.userId === wallet)?.amount })),
    answered: totalAnswered,
    correct: totalCorrect,
    totalEarned,
  };
};
