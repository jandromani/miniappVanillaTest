import { listPayments, PaymentRecord } from "./payment-store";
import { listTournaments } from "./tournaments";

const isConfirmed = (payment: PaymentRecord) => payment.status === "confirmed";

export const getFinanceConsistency = () => {
  const payments = listPayments();
  const tournaments = listTournaments();
  const discrepancies: any[] = [];

  tournaments.forEach((tournament) => {
    const confirmed = payments.filter(
      (p) => p.tournamentId === tournament.id && isConfirmed(p)
    );
    const paidSum = confirmed.reduce((sum, p) => sum + p.amount, 0);
    const expectedSum = (tournament.entries?.length ?? 0) * tournament.entryFee;
    if (Math.abs(paidSum - expectedSum) > 0.0001) {
      discrepancies.push({
        tournamentId: tournament.id,
        paidSum,
        expectedSum,
        entries: tournament.entries?.length ?? 0,
      });
    }
  });

  return {
    ok: discrepancies.length === 0,
    discrepancies,
    totals: {
      confirmedPayments: payments.filter(isConfirmed).length,
      totalPayments: payments.length,
    },
  };
};
