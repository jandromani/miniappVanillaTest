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

const paymentStore = new Map<string, PaymentRecord>();

export const createPaymentReference = (record: Omit<PaymentRecord, "createdAt" | "updatedAt" | "status"> & { status?: PaymentStatus }) => {
  const createdAt = Date.now();
  const payload: PaymentRecord = {
    status: record.status ?? "pending",
    createdAt,
    updatedAt: createdAt,
    ...record,
  };
  paymentStore.set(record.reference, payload);
  return payload;
};

export const getPayment = (reference: string) => paymentStore.get(reference);

export const updatePaymentStatus = (reference: string, status: PaymentStatus, transactionId?: string) => {
  const existing = paymentStore.get(reference);
  if (!existing) return undefined;
  const updated: PaymentRecord = {
    ...existing,
    status,
    transactionId: transactionId ?? existing.transactionId,
    updatedAt: Date.now(),
  };
  paymentStore.set(reference, updated);
  return updated;
};

export const listPayments = () => Array.from(paymentStore.values());
