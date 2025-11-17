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
}

function animateQuestion(session) {
  const question = session.question;
  resetQuestionUI();
  hasLockedAnswer = false;
  activeSession = session;

  const start = session.startTimestamp;
  const deadline = session.deadline;
  const duration = deadline - start;

  questionProgress.textContent = `Pregunta ${question.number} de ${question.total}`;
  gamePot.textContent = `${question.pot} WLD`;

  const fullText = question.text;

  const typewriter = () => {
    if (!activeSession || hasLockedAnswer) return;
    const now = Date.now();
    const elapsed = Math.min(Math.max(0, now - start), duration);
    const progress = duration === 0 ? 1 : elapsed / duration;
    const chars = Math.floor(progress * fullText.length);
    questionText.textContent = fullText.slice(0, chars);
    if (now < deadline) {
      requestAnimationFrame(typewriter);
    } else {
      questionText.textContent = fullText;
    }
  };

  requestAnimationFrame(typewriter);

  const createOptionButton = (option, index) => {
    const button = document.createElement("button");
    button.className =
      "option-button opacity-0 translate-y-2 transition-all duration-300 bg-slate-800/80 border border-slate-700 hover:border-sky-400 text-left px-4 py-3 rounded-xl font-semibold";
    button.textContent = option;
    button.disabled = true;
    button.addEventListener("click", () => handleAnswer(option, index, question.correctIndex));
    optionsContainer.appendChild(button);
    return button;
  };

  const revealStart = start + 4000;

  question.options.forEach((option, index) => {
    const revealAt = revealStart + index * 1000;
    const delay = Math.max(0, revealAt - Date.now());

    revealTimeouts.push(
      setTimeout(() => {
        if (!activeSession || hasLockedAnswer || Date.now() >= deadline) return;
        const button = createOptionButton(option, index);
        requestAnimationFrame(() => {
          button.classList.remove("opacity-0", "translate-y-2");
          button.disabled = Date.now() < revealStart || Date.now() >= deadline;
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
    const now = Date.now();
    const timeLeft = Math.max(0, Math.ceil((deadline - now) / 1000));
    timerLabel.textContent = timeLeft.toString().padStart(2, "0");
    const elapsed = Math.min(duration, Math.max(0, now - start));
    timerRing.style.strokeDashoffset = `${(elapsed / duration) * 100}`;
    progressBar.style.width = `${(elapsed / duration) * 100}%`;

    if (now >= start + 4000 && now < deadline) {
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
    if (Date.now() >= deadline) clearInterval(countdownInterval);
  }, 250);
}

function handleAnswer(option, index, correctIndex, auto = false) {
  if (!activeSession || hasLockedAnswer) return;
  const now = Date.now();
  const start = activeSession.startTimestamp;
  const deadline = activeSession.deadline;

  if (now > deadline) return;
  if (now < start + 4000 && !auto) return;

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
  }).catch((error) => console.error("Error sending answer", error));
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

    await fetch("http://localhost:3000/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: { ...paymentPayload, reference } }),
    });

    sessionStatus.textContent = "Pago iniciado";
    lastVerification.textContent = "Validación pendiente backend";
    fetchTournaments();
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
    deadline: start + 14000,
    question: demoQuestion,
  });
};

const streamQuestions = () => {
  const source = new EventSource("http://localhost:3000/api/game/demo/question");

  source.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      animateQuestion(data);
    } catch (error) {
      console.error("Failed to parse question", error);
    }
  };

  source.addEventListener("tick", (event) => {
    try {
      const data = JSON.parse(event.data);
      if (activeSession && data.nonce === activeSession.nonce) {
        // keep timers aligned with server timestamp if drift is detected
        activeSession.deadline = data.deadline;
      }
    } catch (error) {
      console.error("Failed to parse tick", error);
    }
  });

  source.onerror = () => {
    console.warn("Falling back to demo session");
    bootstrapDemoSession();
  };
};

streamQuestions();
setInterval(fetchTournaments, 5000);

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});

console.log("MiniKit installed:", MiniKit.isInstalled());
