import { loadState, updateState } from "./storage";

export type PaymentStatus = "pending" | "confirmed" | "failed";

export interface PaymentRecord {
  reference: string;
  userId?: string;
  tournamentId?: string;
  token: "WLD" | "USDC";
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
  updatedAt: number;
  createdAt: number;
}

const bootstrap = () => {
  const state = loadState();
  const map = new Map<string, PaymentRecord>();
  state.payments?.forEach((p) => {
    map.set(p.reference, p as PaymentRecord);
  });
  return map;
};

const persist = (map: Map<string, PaymentRecord>) => {
  updateState({ payments: Array.from(map.values()) });
};

const paymentStore = bootstrap();

export const createPaymentReference = (record: Omit<PaymentRecord, "createdAt" | "updatedAt" | "status"> & { status?: PaymentStatus }) => {
  const createdAt = Date.now();
  const payload: PaymentRecord = {
    status: record.status ?? "pending",
    createdAt,
    updatedAt: createdAt,
    ...record,
  };
  paymentStore.set(record.reference, payload);
  persist(paymentStore);
  return payload;
};

export const getPayment = (reference: string) => paymentStore.get(reference);

export const updatePaymentStatus = (reference: string, status: PaymentStatus, transactionId?: string) => {
  const existing = paymentStore.get(reference);
  if (!existing) return undefined;
  if (existing.status === "confirmed" && status === "confirmed") return existing;
  if (existing.status === "confirmed" && status === "pending") return existing;
  const updated: PaymentRecord = {
    ...existing,
    status,
    transactionId: transactionId ?? existing.transactionId,
    updatedAt: Date.now(),
  };
  paymentStore.set(reference, updated);
  persist(paymentStore);
  return updated;
};

export const listPayments = () => Array.from(paymentStore.values());
