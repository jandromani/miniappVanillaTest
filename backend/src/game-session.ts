import crypto from "crypto";
import { appendSuspicious, listSuspicious } from "./audit-store";

interface QuestionPayload {
  gameId: string;
  nonce: string;
  startTimestamp: number;
  answerWindowOpensAt: number;
  deadline: number;
  questionHash: string;
  question: {
    id: string;
    number: number;
    total: number;
    pot: number;
    text: string;
    options: string[];
    correctIndex: number;
    optionHashes: string[];
  };
}

const sessionStore = new Map<string, QuestionPayload>();
const answerAuditLog: AnswerRecord[] = [];

const demoQuestion: QuestionPayload["question"] = {
  id: "demo-q-1",
  number: 3,
  total: 15,
  pot: 150,
  text: "¿Cuál fue el primer satélite artificial lanzado al espacio?",
  options: ["Sputnik 1", "Explorer 1", "Vostok 1", "Soyuz MS-02"],
  correctIndex: 0,
  optionHashes: [],
};

export const createQuestionSession = (gameId: string): QuestionPayload => {
  const startTimestamp = Date.now();
  const answerWindowOpensAt = startTimestamp + 4_000;
  const deadline = startTimestamp + 14_000;
  const questionHash = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        id: demoQuestion.id,
        number: demoQuestion.number,
        text: demoQuestion.text,
        options: demoQuestion.options,
        correctIndex: demoQuestion.correctIndex,
      })
    )
    .digest("hex");
  const optionHashes = demoQuestion.options.map((option, idx) =>
    crypto
      .createHash("sha256")
      .update(`${demoQuestion.id}:${idx}:${option}`)
      .digest("hex")
  );

  const session: QuestionPayload = {
    gameId,
    nonce: crypto.randomUUID(),
    startTimestamp,
    answerWindowOpensAt,
    deadline,
    questionHash,
    question: demoQuestion,
  };

  session.question.optionHashes = optionHashes;

  sessionStore.set(session.nonce, session);
  return session;
};

export const getSession = (nonce: string) => sessionStore.get(nonce);

export const completeSession = (nonce: string) => sessionStore.delete(nonce);

export interface AnswerValidation {
  accepted: boolean;
  reason?: string;
}

export interface AnswerRecord {
  nonce: string;
  gameId: string;
  questionId: string;
  questionHash: string;
  questionNumber: number;
  answerIndex: number;
  correct: boolean;
  answeredAt: number;
  clientAnsweredAt?: number;
  answerTime: number;
  answerHash: string;
  suspicious?: string;
}

export const validateAnswerWindow = (nonce: string, answeredAt: number): AnswerValidation => {
  const session = sessionStore.get(nonce);
  if (!session) return { accepted: false, reason: "session_not_found" };

  const now = Date.now();
  const open = session.answerWindowOpensAt;
  const close = session.deadline;

  if (now < open) {
    return { accepted: false, reason: "answered_too_early_server" };
  }

  if (now > close) {
    return { accepted: false, reason: "answered_after_deadline_server" };
  }

  if (answeredAt < open) {
    return { accepted: false, reason: "answered_too_early" };
  }

  if (answeredAt > close) {
    return { accepted: false, reason: "answered_after_deadline" };
  }

  return { accepted: true };
};

export const recordAnswer = (record: AnswerRecord) => {
  answerAuditLog.push(record);
  if (record.suspicious) {
    appendSuspicious({
      nonce: record.nonce,
      gameId: record.gameId,
      questionId: record.questionId,
      answerIndex: record.answerIndex,
      answerTime: record.answerTime,
      answeredAt: record.answeredAt,
      reason: record.suspicious,
    });
  }
};

export const getSuspiciousAnswers = () =>
  listSuspicious().length ? listSuspicious() : answerAuditLog.filter((record) => record.suspicious !== undefined);

export type QuestionSession = QuestionPayload;
