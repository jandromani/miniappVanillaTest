import { loadState, updateState } from "./storage";

export interface SuspiciousRecord {
  nonce: string;
  gameId: string;
  questionId: string;
  answerIndex: number;
  optionId?: string;
  answerTime: number;
  answeredAt: number;
  reason: string;
  wallet?: string;
}

const bootstrap = () => {
  const state = loadState();
  return (state.suspiciousAnswers as SuspiciousRecord[]) ?? [];
};

let suspiciousAnswers = bootstrap();

export const appendSuspicious = (record: SuspiciousRecord) => {
  suspiciousAnswers = [...suspiciousAnswers, record];
  updateState({ suspiciousAnswers });
};

export const listSuspicious = () => suspiciousAnswers;
