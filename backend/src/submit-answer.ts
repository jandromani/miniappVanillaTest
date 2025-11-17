import crypto from "crypto";
import { RequestHandler } from "express";
import {
  AnswerRecord,
  completeSession,
  getSession,
  recordAnswer,
  validateAnswerWindow,
} from "./game-session";

export const submitAnswerHandler: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { nonce, answerIndex, answeredAt, autoSubmit, questionHash, questionNumber } = req.body as {
    nonce: string;
    answerIndex: number;
    answeredAt: number;
    autoSubmit?: boolean;
    questionHash?: string;
    questionNumber?: number;
  };

  const validation = validateAnswerWindow(nonce, answeredAt);

  if (!validation.accepted) {
    res.status(400).json({ ok: false, reason: validation.reason });
    return;
  }

  const session = getSession(nonce);
  if (!session) {
    res.status(404).json({ ok: false, reason: "session_missing" });
    return;
  }

  if (questionHash && questionHash !== session.questionHash) {
    res.status(400).json({ ok: false, reason: "question_hash_mismatch" });
    return;
  }

  if (questionNumber !== undefined && questionNumber !== session.question.number) {
    res.status(400).json({ ok: false, reason: "question_sequence_error" });
    return;
  }

  const correct = session.question.correctIndex === answerIndex;

  const answerTime = Math.max(0, answeredAt - session.startTimestamp);
  const suspicious = answerTime < 500 ? "answered_too_fast" : undefined;
  const answerHash = crypto
    .createHash("sha256")
    .update(`${session.question.id}:${nonce}:${answerIndex}:${answeredAt}`)
    .digest("hex");

  const record: AnswerRecord = {
    nonce,
    gameId: id,
    questionId: session.question.id,
    questionHash: session.questionHash,
    questionNumber: session.question.number,
    answerIndex,
    correct,
    answeredAt,
    answerTime,
    answerHash,
    suspicious,
  };

  recordAnswer(record);
  completeSession(nonce);

  res.json({
    ok: true,
    gameId: id,
    nonce,
    answerIndex,
    correct,
    autoSubmit: Boolean(autoSubmit),
    answerTime,
    suspicious,
    answerHash,
  });
};
