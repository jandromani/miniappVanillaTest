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

  if (!nonce || typeof answerIndex !== "number" || typeof answeredAt !== "number") {
    res.status(400).json({ ok: false, reason: "invalid_payload" });
    return;
  }

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

  const serverAnsweredAt = Date.now();
  const answerTime = Math.max(0, serverAnsweredAt - session.startTimestamp);
  const suspicious = answerTime < 500 ? "answered_too_fast" : undefined;
  const answerHash = crypto
    .createHash("sha256")
    .update(`${session.question.id}:${nonce}:${answerIndex}:${serverAnsweredAt}`)
    .digest("hex");

  const record: AnswerRecord = {
    nonce,
    gameId: id,
    questionId: session.question.id,
    questionHash: session.questionHash,
    questionNumber: session.question.number,
    answerIndex,
    correct,
    answeredAt: serverAnsweredAt,
    clientAnsweredAt: answeredAt,
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
