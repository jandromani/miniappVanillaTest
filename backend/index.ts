import express from "express";

import { verifyHandler } from "./src/verify";
import { initiatePaymentHandler } from "./src/initiate-payment";
import { confirmPaymentHandler } from "./src/confirm-payment";
import { questionStreamHandler } from "./src/question-stream";
import { submitAnswerHandler } from "./src/submit-answer";
import {
  listTournaments,
  getTournament,
  getLeaderboard,
  processDuePayouts,
} from "./src/tournaments";
import cors from "cors";

const app = express();

// trust the proxy to allow HTTPS protocol to be detected
// https://expressjs.com/en/guide/behind-proxies.html
app.set("trust proxy", true);
// allow cors
app.use(cors());
// json middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// request logger middleware
app.use((req, _res, next) => {
  console.log(`logger: ${req.method} ${req.url}`);
  next();
});

app.get("/ping", (_, res) => {
  res.send("minikit-example pong v1");
});

// protected routes
app.post("/verify", verifyHandler);
app.post("/initiate-payment", initiatePaymentHandler);
app.post("/confirm-payment", confirmPaymentHandler);
app.get("/api/game/:id/question", questionStreamHandler);
app.post("/api/game/:id/answer", submitAnswerHandler);
app.get("/api/tournaments", (_req, res) => {
  res.json({ tournaments: listTournaments() });
});
app.get("/api/tournaments/:id", (req, res) => {
  const tournament = getTournament(req.params.id);
  if (!tournament) {
    res.status(404).json({ ok: false, reason: "not_found" });
    return;
  }
  res.json({ ok: true, tournament });
});
app.get("/api/tournaments/:id/leaderboard", (req, res) => {
  const leaderboard = getLeaderboard(req.params.id);
  if (!leaderboard) {
    res.status(404).json({ ok: false, reason: "not_found" });
    return;
  }
  res.json({ ok: true, leaderboard });
});

const port = 3000; // use env var
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// basic cron simulation for payouts
setInterval(() => {
  const processed = processDuePayouts();
  if (processed.length) {
    console.log(
      `Processed payouts for tournaments: ${processed.map((t) => t.id).join(", ")}`
    );
  }
}, 30_000);
