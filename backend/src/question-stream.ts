import { RequestHandler } from "express";
import { createQuestionSession } from "./game-session";
import { signPayload } from "./time-signature";

export const questionStreamHandler: RequestHandler = (req, res) => {
  const { id } = req.params;
  const session = createQuestionSession(id);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const sendQuestion = () => {
    const payload = {
      ...session,
      question: { ...session.question, correctOptionId: undefined },
      serverTime: Date.now(),
    };
    res.write(`data: ${JSON.stringify({ ...payload, signature: signPayload(payload) })}\n\n`);
  };

  const sendTick = () => {
    const payload = {
      nonce: session.nonce,
      startTimestamp: session.startTimestamp,
      answerWindowOpensAt: session.answerWindowOpensAt,
      deadline: session.deadline,
      serverTime: Date.now(),
    };
    res.write(`event: tick\ndata: ${JSON.stringify({ ...payload, signature: signPayload(payload) })}\n\n`);
  };

  sendQuestion();
  const tickInterval = setInterval(sendTick, 1000);

  req.on("close", () => {
    clearInterval(tickInterval);
    res.end();
  });
};
