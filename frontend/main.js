import "./index.css";
import { MiniKit } from "https://cdn.jsdelivr.net/npm/@worldcoin/minikit-js@1.1.1/+esm";

MiniKit.install();

const TIME_HMAC_SECRET = "dev-time-secret";
let hmacKeyPromise;
const getHmacKey = async () => {
  if (!hmacKeyPromise) {
    hmacKeyPromise = crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(TIME_HMAC_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }
  return hmacKeyPromise;
};

const hexToArrayBuffer = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
};

const verifySignature = async (payload, signature) => {
  if (!signature) return false;
  try {
    const key = await getHmacKey();
    const data = new TextEncoder().encode(JSON.stringify(payload));
    return crypto.subtle.verify("HMAC", key, hexToArrayBuffer(signature), data);
  } catch (error) {
    console.error("Signature verification failed", error);
    return false;
  }
};

const toastRoot = document.getElementById("toast-root");
const showToast = (message, variant = "info") => {
  if (!toastRoot) return;
  const toast = document.createElement("div");
  const styles = {
    info: "bg-slate-800 text-slate-100",
    success: "bg-emerald-600 text-emerald-50",
    error: "bg-rose-600 text-rose-50",
  };
  toast.className = `toast ${styles[variant] ?? styles.info}`;
  toast.textContent = message;
  toastRoot.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
};

const sessionStatus = document.getElementById("session-status");
const lastVerification = document.getElementById("last-verification");
const connectButton = document.getElementById("connect-worldcoin");
const walletInput = document.getElementById("wallet-input");
const featuredName = document.getElementById("featured-name");
const featuredStatus = document.getElementById("featured-status");
const featuredPrize = document.getElementById("featured-prize");
const featuredEntry = document.getElementById("featured-entry");
const featuredTime = document.getElementById("featured-time");
const featuredPlayers = document.getElementById("featured-players");
const joinFeatured = document.getElementById("join-featured");
const leaderboardList = document.getElementById("leaderboard");
const tournamentList = document.getElementById("tournament-list");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options");
const timerLabel = document.getElementById("timer-label");
const timerRing = document.getElementById("timer-ring");
const questionProgress = document.getElementById("question-progress");
const progressBar = document.getElementById("progress-bar");
const gamePot = document.getElementById("game-pot");
const answerStatus = document.getElementById("answer-status");
const sseStatus = document.getElementById("sse-status");

let tournaments = [];
let leaderboard = [];
let leaderboardTournamentId = null;

const demoQuestion = {
  number: 3,
  total: 15,
  pot: 150,
  text: "¿Cuál fue el primer satélite artificial lanzado al espacio?",
  options: [
    "Sputnik 1",
    "Explorer 1",
    "Vostok 1",
    "Soyuz MS-02",
  ],
  correctIndex: 0,
};

let revealTimeouts = [];
let countdownInterval = null;
let activeSession = null;
let hasLockedAnswer = false;
let serverOffsetMs = 0;
let questionSource = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
let currentWallet = "anon-player";
let sessionToken = null;
let sessionWallet = "anon-player";
let lastPaymentSignature = null;
let lastPayloadBase = null;
let lastPaymentReference = null;

const serverNow = () => Date.now() + serverOffsetMs;

const reconcileServerTime = (serverTime) => {
  if (typeof serverTime !== "number") return;
  serverOffsetMs = serverTime - Date.now();
};

const setSSEIndicator = (state, message) => {
  if (!sseStatus) return;
  sseStatus.textContent = message;
  sseStatus.classList.remove("text-amber-300", "text-emerald-300", "text-rose-300");
  const color =
    state === "connected" ? "text-emerald-300" : state === "reconnecting" ? "text-amber-300" : "text-rose-300";
  sseStatus.classList.add(color);
};

const statusMap = {
  open: {
    label: "Abierto",
    classes: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  },
  active: {
    label: "En curso",
    classes: "bg-amber-500/20 text-amber-200 border border-amber-500/30",
  },
  finished: {
    label: "Finalizado",
    classes: "bg-rose-500/20 text-rose-200 border border-rose-500/30",
  },
};

const positionBadge = (pos) => {
  if (pos === 1) return "bg-amber-400/80 text-slate-900";
  if (pos === 2) return "bg-slate-200 text-slate-900";
  if (pos === 3) return "bg-amber-700/60 text-amber-100";
  return "bg-slate-800 text-slate-200";
};

const formatRemaining = (tournament) => {
  if (tournament.status === "finished") return "Finalizado";
  const delta = Math.max(0, tournament.endsAt - Date.now());
  const hours = Math.floor(delta / (1000 * 60 * 60));
  const minutes = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60));
  if (hours <= 0 && minutes <= 0) return "En vivo";
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
};

function renderTournaments(filter = "open") {
  tournamentList.innerHTML = "";
  tournaments
    .filter((t) => t.status === filter)
    .forEach((tournament) => {
      const statusInfo = statusMap[tournament.status];
      const card = document.createElement("article");
      card.className =
        "glow-card border border-slate-800 rounded-2xl p-4 flex flex-col gap-3";
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-400 uppercase tracking-[0.2em]">${tournament.status === "finished" ? "Histórico" : "Torneo"}</p>
            <h4 class="text-lg font-semibold">${tournament.name}</h4>
          </div>
          <span class="${statusInfo.classes} px-3 py-1 rounded-full text-xs font-semibold">${statusInfo.label}</span>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-slate-400">Prize Pool</p>
            <p class="text-xl font-bold text-amber-300">${tournament.prizePool.toFixed(2)} WLD</p>
            <p class="text-xs text-slate-400">Rake ${(tournament.rakePercent * 100).toFixed(0)}% → ${(tournament.rakeAmount ?? 0).toFixed(2)} WLD</p>
          </div>
          <div>
            <p class="text-slate-400">Entry Fee</p>
            <p class="text-base font-semibold">${tournament.entryFee.toFixed(2)} WLD</p>
          </div>
          <div>
            <p class="text-slate-400">Tiempo</p>
            <p class="font-semibold">${formatRemaining(tournament)}</p>
          </div>
          <div>
            <p class="text-slate-400">Jugadores</p>
            <p class="font-semibold">${tournament.players}</p>
          </div>
        </div>
        ${
          tournament.payoutTxHash
            ? `<p class="text-xs text-slate-400">Payout: <a class="text-amber-300 underline" target="_blank" rel="noreferrer" href="${tournament.explorerBaseUrl ? `${tournament.explorerBaseUrl}/${tournament.payoutTxHash}` : "#"}">${tournament.payoutTxHash}</a>${tournament.explorerBaseUrl ? "" : " (simulado)"}</p>`
            : ""
        }
        <button class="join-button w-full bg-indigo-500 hover:bg-indigo-400 transition-colors px-4 py-2 rounded-xl font-semibold shadow-lg shadow-indigo-500/30" data-id="${tournament.id}">
          ${tournament.status === "open" ? "Unirse al torneo" : "Ver detalle"}
        </button>
      `;
      tournamentList.appendChild(card);
    });
}

function renderFeatured() {
  const openTournament = tournaments.find((t) => t.status === "open") || tournaments[0];
  if (!openTournament) return;
  featuredName.textContent = openTournament.name;
  featuredPrize.textContent = `${openTournament.prizePool.toFixed(2)} WLD`;
  featuredEntry.textContent = `${openTournament.entryFee.toFixed(2)} WLD`;
  featuredTime.textContent = formatRemaining(openTournament);
  featuredPlayers.textContent = `${openTournament.players} jugadores`;
  featuredStatus.textContent = statusMap[openTournament.status].label;
  featuredStatus.className = `${statusMap[openTournament.status].classes} px-3 py-1 rounded-full text-xs font-semibold`;
}

function renderLeaderboard() {
  leaderboardList.innerHTML = "";
  leaderboard.forEach((row) => {
    const item = document.createElement("div");
    item.className = "flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl px-3 py-2";
    item.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="h-9 w-9 rounded-xl flex items-center justify-center font-bold ${positionBadge(row.position)}">${row.position}</span>
        <div>
          <p class="font-semibold">${row.wallet ?? row.userId}</p>
          <p class="text-xs text-slate-400">${(row.timeMs / 1000).toFixed(2)}s</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm text-slate-300">Aciertos ${row.correct}</p>
        <p class="text-amber-300 font-semibold">${(row.reward ?? 0).toFixed(2)} WLD</p>
      </div>
    `;
    leaderboardList.appendChild(item);
  });
}

async function fetchTournaments() {
  try {
    const response = await fetch("http://localhost:3000/api/tournaments");
    const data = await response.json();
    tournaments = data.tournaments ?? [];
    renderFeatured();
    renderTournaments(document.querySelector(".tab-button.bg-slate-800")?.dataset.tab ?? "open");

    const active = tournaments.find((t) => t.status !== "finished") ?? tournaments[0];
    if (active && active.id !== leaderboardTournamentId) {
      leaderboardTournamentId = active.id;
      await fetchLeaderboard(active.id);
    }
  } catch (error) {
    console.error("Failed to fetch tournaments", error);
  }
}

async function fetchLeaderboard(tournamentId) {
  try {
    const response = await fetch(`http://localhost:3000/api/tournaments/${tournamentId}/leaderboard`);
    const data = await response.json();
    leaderboard = data.leaderboard ?? [];
    renderLeaderboard();
  } catch (error) {
    console.error("Failed to fetch leaderboard", error);
  }
}

function resetQuestionUI() {
  optionsContainer.innerHTML = "";
  revealTimeouts.forEach(clearTimeout);
  revealTimeouts = [];
  if (countdownInterval) clearInterval(countdownInterval);
  timerLabel.textContent = "14";
  timerRing.style.strokeDashoffset = "0";
  progressBar.style.width = "0%";
  questionText.textContent = "";
  answerStatus.textContent = "";
}

function animateQuestion(session) {
  const question = session.question;
  resetQuestionUI();
  hasLockedAnswer = false;
  activeSession = session;

  const start = session.startTimestamp;
  const answerWindowOpensAt = session.answerWindowOpensAt ?? start + 4000;
  const deadline = session.deadline;
  const showPhaseDuration = answerWindowOpensAt - start;
  const duration = deadline - start;

  questionProgress.textContent = `Pregunta ${question.number} de ${question.total}`;
  gamePot.textContent = `${question.pot} WLD`;

  const fullText = question.text;

  const typewriter = () => {
    if (!activeSession || hasLockedAnswer) return;
    const now = serverNow();
    const elapsed = Math.min(Math.max(0, now - start), showPhaseDuration);
    const progress = showPhaseDuration === 0 ? 1 : elapsed / showPhaseDuration;
    const chars = Math.floor(progress * fullText.length);
    questionText.textContent = fullText.slice(0, chars);
    if (now < answerWindowOpensAt) {
      requestAnimationFrame(typewriter);
    } else {
      questionText.textContent = fullText;
    }
  };

  requestAnimationFrame(typewriter);

  const createOptionButton = (option, index) => {
    const button = document.createElement("button");
    button.className =
      "option-button opacity-0 translate-y-2 transition-all duration-300 bg-slate-800/80 border border-slate-700 hover:border-sky-400 text-left px-4 py-3 rounded-xl font-semibold select-none";
    button.textContent = option.label;
    button.disabled = true;
    button.dataset.optionId = option.id;
    button.addEventListener("click", () => handleAnswer(option, index));
    optionsContainer.appendChild(button);
    return button;
  };

  const revealStart = start;
  const revealStep = Math.max(250, Math.floor(showPhaseDuration / question.options.length));

  question.options.forEach((option, index) => {
    const revealAt = revealStart + index * revealStep;
    const delay = Math.max(0, revealAt - serverNow());

    revealTimeouts.push(
      setTimeout(() => {
        if (!activeSession || hasLockedAnswer || serverNow() >= deadline) return;
        const button = createOptionButton(option, index);
        requestAnimationFrame(() => {
          button.classList.remove("opacity-0", "translate-y-2");
          const now = serverNow();
          button.disabled = now < answerWindowOpensAt || now >= deadline;
        });
      }, delay)
    );
  });

  const lockAnswers = () => {
    const buttons = optionsContainer.querySelectorAll("button");
    buttons.forEach((btn) => {
      btn.disabled = true;
      btn.classList.add("cursor-not-allowed", "opacity-40");
    });
  };

  const tick = () => {
    const now = serverNow();
    const timeLeft = Math.max(0, Math.ceil((deadline - now) / 1000));
    timerLabel.textContent = timeLeft.toString().padStart(2, "0");
    const elapsed = Math.min(duration, Math.max(0, now - start));
    timerRing.style.strokeDashoffset = `${(elapsed / duration) * 100}`;
    progressBar.style.width = `${(elapsed / duration) * 100}%`;

    if (now >= answerWindowOpensAt && now < deadline) {
      optionsContainer.querySelectorAll("button").forEach((btn) => {
        btn.disabled = false;
        btn.classList.remove("opacity-40", "cursor-not-allowed");
      });
    }

    if (now >= deadline && !hasLockedAnswer) {
      lockAnswers();
      handleAnswer(null, -1, null, true);
    }
  };

  tick();
  countdownInterval = setInterval(() => {
    tick();
    if (serverNow() >= deadline) clearInterval(countdownInterval);
  }, 250);
}

async function handleAnswer(option, index, _unusedCorrectIndex, auto = false) {
  if (!activeSession || hasLockedAnswer) return;
  const now = serverNow();
  const start = activeSession.startTimestamp;
  const deadline = activeSession.deadline;
  const answerWindowOpensAt = activeSession.answerWindowOpensAt ?? start + 4000;

  if (now > deadline) {
    answerStatus.textContent = "Respuesta rechazada: ventana cerrada (0s).";
    showToast("Ventana cerrada: no se puede responder.", "error");
    return;
  }
  if (now < answerWindowOpensAt && !auto) {
    answerStatus.textContent = "Respuesta bloqueada hasta los 10s restantes.";
    showToast("Espera a que se abra la ventana de respuesta.", "info");
    return;
  }

  if (!sessionToken) {
    showToast("Autentica con World ID antes de responder.", "error");
    answerStatus.textContent = "Necesitas token de sesión activo.";
    return;
  }

  hasLockedAnswer = true;
  const buttons = optionsContainer.querySelectorAll("button");
  buttons.forEach((btn) => {
    btn.disabled = true;
    btn.classList.add("cursor-not-allowed");
  });

  const payload = {
    nonce: activeSession.nonce,
    answerIndex: index,
    optionId: option?.id ?? "no-answer",
    answeredAt: now,
    autoSubmit: auto,
    questionHash: activeSession.questionHash,
    questionNumber: activeSession.question?.number,
  };

  try {
    const response = await fetch(`http://localhost:3000/api/game/${activeSession.gameId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.json().catch(() => ({}));
      const reason =
        message?.reason === "answered_too_early_server"
          ? "Backend: intentaste responder antes de los 10s."
          : message?.reason === "answered_after_deadline_server"
          ? "Backend: llegaste después de 0s."
          : message?.reason === "rate_limited"
          ? "Backend: demasiados intentos en la misma pregunta."
          : "Respuesta rechazada por el backend.";
      answerStatus.textContent = reason;
      showToast(reason, "error");
      return;
    }

    const result = await response.json();
    const correctOptionId = result.correctOptionId;
    optionsContainer.querySelectorAll("button").forEach((btn) => {
      const isCorrect = btn.dataset.optionId === correctOptionId;
      if (isCorrect) {
        btn.classList.add("border-emerald-400", "shadow-lg", "shadow-emerald-500/30");
      }
      if (btn.dataset.optionId === option?.id && !isCorrect) {
        btn.classList.add("border-rose-500", "shadow-lg", "shadow-rose-500/30", "animate-[shake_300ms_ease]");
      }
    });

    answerStatus.textContent = auto
      ? "Envío automático al expirar el tiempo."
      : result.correct
        ? "Respuesta correcta registrada."
        : "Respuesta registrada (incorrecta).";
    showToast(answerStatus.textContent, result.correct ? "success" : "info");
  } catch (error) {
    console.error("Error sending answer", error);
    answerStatus.textContent = "No se pudo enviar la respuesta al servidor.";
    showToast("No se pudo enviar la respuesta.", "error");
  }
}

function setActiveTab(tab) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    const isActive = button.dataset.tab === tab;
    button.classList.toggle("bg-slate-800", isActive);
    button.classList.toggle("text-white", isActive);
    button.classList.toggle("text-slate-400", !isActive);
  });
  renderTournaments(tab);
}

async function handleVerify() {
  if (!MiniKit.isInstalled()) {
    sessionStatus.textContent = "MiniKit no instalado";
    sessionStatus.classList.replace("text-emerald-400", "text-rose-400");
    return;
  }

  try {
    const wallet = walletInput?.value?.trim() || currentWallet;
    const { finalPayload } = await MiniKit.commandsAsync.verify({
      action: "join-tournament",
      signal: "demo-signal",
      verification_level: "orb",
    });

    const verifyResponse = await fetch("http://localhost:3000/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: finalPayload, action: "join-tournament", signal: "demo-signal", wallet }),
    });

    if (!verifyResponse.ok) {
      sessionStatus.textContent = "Verificación rechazada";
      showToast("El backend rechazó la verificación de World ID", "error");
      return;
    }

    const verifyData = await verifyResponse.json();
    sessionToken = verifyData.token;
    sessionWallet = verifyData.wallet ?? wallet;
    currentWallet = sessionWallet;
    if (walletInput && !walletInput.value) {
      walletInput.value = sessionWallet;
    }
    lastVerification.textContent = "World ID verificado";
    sessionStatus.textContent = "Sesión validada";
    showToast("Sesión autenticada y firmada.", "success");
  } catch (error) {
    console.error("World ID verify failed", error);
    sessionToken = null;
    sessionStatus.textContent = "Verificación fallida";
    lastVerification.textContent = "Sin verificación";
    showToast("No se pudo verificar World ID. Intenta de nuevo.", "error");
  }
}

async function handlePay(tournament) {
  if (!MiniKit.isInstalled()) {
    sessionStatus.textContent = "MiniKit no instalado";
    sessionStatus.classList.replace("text-emerald-400", "text-rose-400");
    return;
  }

  if (!sessionToken) {
    showToast("Autentica con World ID antes de pagar.", "error");
    return;
  }

  try {
    const referenceResponse = await fetch("http://localhost:3000/initiate-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({ tournamentId: tournament.id }),
    });
    if (!referenceResponse.ok) {
      const err = await referenceResponse.json().catch(() => ({}));
      showToast(`No se pudo iniciar el pago (${err.reason ?? "desconocido"}).`, "error");
      return;
    }
    const { id: reference, signature, amount, token, to } = await referenceResponse.json();
    lastPaymentSignature = signature;
    lastPaymentReference = reference;

    const paymentPayload = await MiniKit.commandsAsync.pay({
      reference,
      to,
      tokens: [
        {
          symbol: token,
          token_amount: amount.toString(),
        },
      ],
      description: `Entrada a ${tournament.name}`,
    });

    sessionStatus.textContent = "Pago en curso...";
    showToast("Pago enviado, verificando en World App...", "info");
    const confirmation = await fetch("http://localhost:3000/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({ payload: { ...paymentPayload, reference }, signature }),
    });

    if (!confirmation.ok) {
      const err = await confirmation.json().catch(() => ({}));
      sessionStatus.textContent = "Pago fallido";
      lastVerification.textContent = "Revisa el estado en World App";
      showToast(
        `Pago fallido o pendiente (${err.reason ?? "consulta en World App"}).`,
        "error"
      );
    } else {
      sessionStatus.textContent = "Pago confirmado";
      lastVerification.textContent = "Entrada acreditada";
      fetchTournaments();
      showToast("Pago confirmado y entrada aplicada.", "success");
    }
  } catch (error) {
    sessionStatus.textContent = "Pago simulado (dev)";
    lastVerification.textContent = "Revisión manual";
    showToast("Pago simulado en modo dev.", "info");
  }
}

connectButton?.addEventListener("click", handleVerify);
joinFeatured?.addEventListener("click", () => {
  const openTournament = tournaments.find((t) => t.status === "open") || tournaments[0];
  if (openTournament) handlePay(openTournament);
});

window.addEventListener("click", (event) => {
  if (event.target.matches(".join-button")) {
    const id = Number(event.target.dataset.id);
    const selected = tournaments.find((t) => t.id == id);
    if (selected?.status === "open") {
      handlePay(selected);
    }
  }
});

// Initialize UI
setActiveTab("open");
fetchTournaments();
renderLeaderboard();
const bootstrapDemoSession = () => {
  const start = Date.now();
  animateQuestion({
    gameId: "demo",
    nonce: crypto.randomUUID(),
    startTimestamp: start,
    answerWindowOpensAt: start + 4000,
    deadline: start + 14000,
    question: demoQuestion,
  });
};

const streamQuestions = () => {
  if (questionSource) {
    questionSource.close();
  }

  setSSEIndicator("reconnecting", "Conectando SSE...");
  questionSource = new EventSource("http://localhost:3000/api/game/demo/question");

  questionSource.onopen = () => {
    setSSEIndicator("connected", "SSE en vivo");
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    reconnectAttempts = 0;
  };

  questionSource.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      const { signature, ...payload } = data;
      const valid = await verifySignature(payload, signature);
      if (!valid) {
        showToast("Firma de tiempo no válida: ignorando evento.", "error");
        return;
      }
      if (payload.serverTime) {
        reconcileServerTime(payload.serverTime);
      }
      animateQuestion(payload);
    } catch (error) {
      console.error("Failed to parse question", error);
    }
  };

  questionSource.addEventListener("tick", async (event) => {
    try {
      const data = JSON.parse(event.data);
      const { signature, ...payload } = data;
      const valid = await verifySignature(payload, signature);
      if (!valid) {
        showToast("Tick rechazado por firma inválida.", "error");
        return;
      }
      reconcileServerTime(payload.serverTime);
      if (activeSession && payload.nonce === activeSession.nonce) {
        activeSession.deadline = payload.deadline;
        activeSession.startTimestamp = payload.startTimestamp;
        activeSession.answerWindowOpensAt = payload.answerWindowOpensAt;
      }
    } catch (error) {
      console.error("Failed to parse tick", error);
    }
  });

  questionSource.onerror = () => {
    setSSEIndicator("reconnecting", "SSE desconectado, reintentando...");
    answerStatus.textContent = "SSE desconectado, reintentando con backoff";
    const delay = Math.min(10_000, 1000 * Math.pow(2, reconnectAttempts));
    reconnectAttempts += 1;
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        streamQuestions();
      }, delay);
    }
  };
};

streamQuestions();
setInterval(fetchTournaments, 5000);

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});

console.log("MiniKit installed:", MiniKit.isInstalled());
