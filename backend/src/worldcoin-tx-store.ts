import { loadState, updateState } from "./storage";

type WorldcoinTxLog = {
  txId: string;
  reference: string;
  status?: string;
  symbol?: string;
  token_amount?: number;
  to?: string;
  ok: boolean;
  reason?: string;
  timestamp: number;
  transaction?: any;
};

const bootstrap = () => {
  const state = loadState();
  return (state as any).worldcoinTxLogs ?? [];
};

const logs: WorldcoinTxLog[] = bootstrap();

export const logWorldcoinVerification = (entry: Partial<WorldcoinTxLog> & { reference: string; txId: string }) => {
  const log: WorldcoinTxLog = {
    ok: false,
    timestamp: Date.now(),
    ...entry,
  } as WorldcoinTxLog;
  if (entry.transaction) {
    log.status = entry.transaction.status;
    log.symbol = entry.transaction.tokens?.[0]?.symbol;
    log.token_amount = Number(entry.transaction.tokens?.[0]?.token_amount ?? 0);
    log.to = entry.transaction.to;
  }
  logs.push(log);
  updateState({ worldcoinTxLogs: logs as any });
  return log;
};

export const listWorldcoinLogs = () => logs;
