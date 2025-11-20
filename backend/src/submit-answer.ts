import crypto from "crypto";
import { RequestHandler } from "express";
import {
  AnswerRecord,
  completeSession,
  getSession,
  recordAnswer,
  registerAttempt,
  resetAttempt,
  validateAnswerWindow,
} from "./game-session";
import { appendSuspicious } from "./audit-store";
import { recordTournamentAnswer } from "./tournaments";
import { AuthedRequest } from "./auth";

export const submitAnswerHandler: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { nonce, answerIndex, answeredAt, autoSubmit, questionHash, questionNumber, optionId } = req.body as {
    nonce: string;
    answerIndex: number;
    answeredAt: number;
    autoSubmit?: boolean;
    questionHash?: string;
    questionNumber?: number;
    optionId?: string;
  };

  const wallet = (req as AuthedRequest).user?.wallet ?? "anon-player";

  if (!nonce || typeof answerIndex !== "number" || typeof answeredAt !== "number" || !optionId) {
    res.status(400).json({ ok: false, reason: "invalid_payload" });
    return;
  }

  const attemptKey = `${nonce}:${wallet ?? req.ip ?? "anon"}`;
  const attempt = registerAttempt(attemptKey, 3);
  if (!attempt.allowed) {
    appendSuspicious({
      nonce,
      gameId: id,
      questionId: "unknown",
      answerIndex,
      optionId,
      answerTime: 0,
      answeredAt: Date.now(),
      wallet,
      reason: "too_many_attempts",
    });
    res.status(429).json({ ok: false, reason: "rate_limited" });
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

  const option = session.question.options.find((opt, idx) => idx === answerIndex && opt.id === optionId);
  const isNoAnswer = optionId === "no-answer" || answerIndex < 0;
  const correct = isNoAnswer ? false : option?.id === session.question.correctOptionId;
  if (!option && !isNoAnswer) {
    res.status(400).json({ ok: false, reason: "option_not_found" });
    return;
  }

  const serverAnsweredAt = Date.now();
  const answerTime = Math.max(0, serverAnsweredAt - session.startTimestamp);
  const suspicious = !attempt.allowed
    ? "too_many_attempts"
    : answerTime < 500
      ? "answered_too_fast"
      : undefined;
  const answerHash = crypto
    .createHash("sha256")
    .update(`${session.question.id}:${nonce}:${optionId}:${serverAnsweredAt}`)
    .digest("hex");

  const record: AnswerRecord = {
    nonce,
    gameId: id,
    questionId: session.question.id,
    questionHash: session.questionHash,
    questionNumber: session.question.number,
    answerIndex,
    optionId,
    correct,
    answeredAt: serverAnsweredAt,
    clientAnsweredAt: answeredAt,
    answerTime,
    answerHash,
    suspicious,
    wallet,
  };

  recordAnswer(record);
  completeSession(nonce);
  resetAttempt(attemptKey);
  recordTournamentAnswer(id, {
    wallet: wallet ?? "anon-player",
    questionNumber: session.question.number,
    correct: Boolean(correct),
    answerTime,
    gameId: id,
    nonce,
    answeredAt: serverAnsweredAt,
  });

  res.json({
    ok: true,
    gameId: id,
    nonce,
    answerIndex,
    optionId,
    correct,
    autoSubmit: Boolean(autoSubmit),
    answerTime,
    suspicious,
    answerHash,
    correctOptionId: session.question.correctOptionId,
  });
};
