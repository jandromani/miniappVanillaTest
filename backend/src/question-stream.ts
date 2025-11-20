import { RequestHandler } from "express";
import { createQuestionSession } from "./game-session";

export const questionStreamHandler: RequestHandler = (req, res) => {
  const { id } = req.params;
  const session = createQuestionSession(id);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const sendQuestion = () => {
    res.write(
      `data: ${JSON.stringify({ ...session, serverTime: Date.now() })}\n\n`
    );
  };

  const sendTick = () => {
    res.write(
      `event: tick\ndata: ${JSON.stringify({
        nonce: session.nonce,
        startTimestamp: session.startTimestamp,
        answerWindowOpensAt: session.answerWindowOpensAt,
        deadline: session.deadline,
        serverTime: Date.now(),
      })}\n\n`
    );
  };

  sendQuestion();
  const tickInterval = setInterval(sendTick, 3000);

  req.on("close", () => {
    clearInterval(tickInterval);
    res.end();
  });
};
