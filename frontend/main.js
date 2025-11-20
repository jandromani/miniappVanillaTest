import "./index.css";
import { MiniKit } from "https://cdn.jsdelivr.net/npm/@worldcoin/minikit-js@1.1.1/+esm";

MiniKit.install();

const sessionStatus = document.getElementById("session-status");
const lastVerification = document.getElementById("last-verification");
const connectButton = document.getElementById("connect-worldcoin");
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

const serverNow = () => Date.now() + serverOffsetMs;

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

  const createOptionButton = (label, index) => {
    const button = document.createElement("button");
    button.className =
      "option-button opacity-0 translate-y-2 transition-all duration-300 bg-slate-800/80 border border-slate-700 hover:border-sky-400 text-left px-4 py-3 rounded-xl font-semibold select-none";
    button.textContent = label;
    button.disabled = true;
    button.addEventListener("click", () => handleAnswer(label, index, question.correctIndex));
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
      handleAnswer(null, -1, question.correctIndex, true);
    }
  };

  tick();
  countdownInterval = setInterval(() => {
    tick();
    if (serverNow() >= deadline) clearInterval(countdownInterval);
  }, 250);
}

function handleAnswer(option, index, correctIndex, auto = false) {
  if (!activeSession || hasLockedAnswer) return;
  const now = serverNow();
  const start = activeSession.startTimestamp;
  const deadline = activeSession.deadline;
  const answerWindowOpensAt = activeSession.answerWindowOpensAt ?? start + 4000;

  if (now > deadline) {
    answerStatus.textContent = "Respuesta rechazada: ventana cerrada (0s).";
    return;
  }
  if (now < answerWindowOpensAt && !auto) {
    answerStatus.textContent = "Respuesta bloqueada hasta los 10s restantes.";
    return;
  }

  hasLockedAnswer = true;
  const buttons = optionsContainer.querySelectorAll("button");
  buttons.forEach((btn, btnIndex) => {
    btn.disabled = true;
    btn.classList.add("cursor-not-allowed");
    if (btnIndex === correctIndex) {
      btn.classList.add("border-emerald-400", "shadow-lg", "shadow-emerald-500/30");
    }
    if (index === btnIndex && index !== correctIndex) {
      btn.classList.add("border-rose-500", "shadow-lg", "shadow-rose-500/30", "animate-[shake_300ms_ease]");
    }
  });

  const payload = {
    nonce: activeSession.nonce,
    answerIndex: index,
    answeredAt: now,
    autoSubmit: auto,
    questionHash: activeSession.questionHash,
    questionNumber: activeSession.question?.number,
  };

  fetch(`http://localhost:3000/api/game/${activeSession.gameId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      if (!response.ok) {
        const message = await response.json().catch(() => ({}));
        answerStatus.textContent =
          message?.reason === "answered_too_early_server"
            ? "Backend: intentaste responder antes de los 10s."
            : message?.reason === "answered_after_deadline_server"
            ? "Backend: llegaste después de 0s."
            : "Respuesta rechazada por el backend.";
      } else {
        answerStatus.textContent = auto
          ? "Envío automático al expirar el tiempo."
          : "Respuesta enviada y aceptada.";
      }
    })
    .catch((error) => {
      console.error("Error sending answer", error);
      answerStatus.textContent = "No se pudo enviar la respuesta al servidor.";
    });
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
    const { finalPayload } = await MiniKit.commandsAsync.verify({
      action: "join-tournament",
      signal: "demo-signal",
      verification_level: "orb",
    });

    lastVerification.textContent = "World ID verificado";
    sessionStatus.textContent = finalPayload.status === "success" ? "Sesión validada" : "Intento de verificación";
  } catch (error) {
    lastVerification.textContent = "Modo mock (dev)";
    sessionStatus.textContent = "Sesión simulada";
  }
}

async function handlePay(tournament) {
  if (!MiniKit.isInstalled()) {
    sessionStatus.textContent = "MiniKit no instalado";
    sessionStatus.classList.replace("text-emerald-400", "text-rose-400");
    return;
  }

  try {
    const referenceResponse = await fetch("http://localhost:3000/initiate-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tournamentId: tournament.id, token: "WLD", amount: tournament.entryFee }),
    });
    const { id: reference } = await referenceResponse.json();

    const paymentPayload = await MiniKit.commandsAsync.pay({
      reference,
      to: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
      tokens: [
        {
          symbol: "WLD",
          token_amount: tournament.entryFee.toString(),
        },
      ],
      description: `Entrada a ${tournament.name}`,
    });

    sessionStatus.textContent = "Pago en curso...";
    const confirmation = await fetch("http://localhost:3000/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: { ...paymentPayload, reference } }),
    });

    if (!confirmation.ok) {
      sessionStatus.textContent = "Pago fallido";
      lastVerification.textContent = "Revisa el estado en World App";
    } else {
      sessionStatus.textContent = "Pago confirmado";
      lastVerification.textContent = "Entrada acreditada";
      fetchTournaments();
    }
  } catch (error) {
    sessionStatus.textContent = "Pago simulado (dev)";
    lastVerification.textContent = "Revisión manual";
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
  };

  questionSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.serverTime) {
        serverOffsetMs = data.serverTime - Date.now();
      }
      animateQuestion(data);
    } catch (error) {
      console.error("Failed to parse question", error);
    }
  };

  questionSource.addEventListener("tick", (event) => {
    try {
      const data = JSON.parse(event.data);
      serverOffsetMs = data.serverTime - Date.now();
      if (activeSession && data.nonce === activeSession.nonce) {
        activeSession.deadline = data.deadline;
        activeSession.startTimestamp = data.startTimestamp;
        activeSession.answerWindowOpensAt = data.answerWindowOpensAt;
      }
    } catch (error) {
      console.error("Failed to parse tick", error);
    }
  });

  questionSource.onerror = () => {
    setSSEIndicator("reconnecting", "SSE desconectado, reintentando...");
    answerStatus.textContent = "SSE desconectado, usando sesión demo local";
    bootstrapDemoSession();
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(streamQuestions, 5000);
    }
  };
};

streamQuestions();
setInterval(fetchTournaments, 5000);

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});

console.log("MiniKit installed:", MiniKit.isInstalled());
