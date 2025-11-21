import "./index.css";
import { MiniKit } from "https://cdn.jsdelivr.net/npm/@worldcoin/minikit-js@1.1.1/+esm";

const translations = {
  es: {
    brandOverline: "World Chain",
    brandTitle: "50x15 Trivia Arena",
    connectButton: "Conectar con Worldcoin",
    heroOverline: "Trivia estilo ¿Quién quiere ser millonario?",
    heroTitle: "Torneos sincronizados, pagos en WLD y verificación World ID",
    heroSubtitle:
      "Juega partidas de 15 preguntas con temporizador de 14 segundos, pagos en WLD y ranking en vivo sobre World Chain. Todo está listo con MiniKit para autenticar, pagar y auditar resultados.",
    badgeCron: "Cron cada 6h",
    badgePrize: "Prize Pool on-chain",
    badgeAnti: "Anti-cheat timing",
    walletLabel: "Wallet (World App)",
    sessionLabel: "Estado de sesión",
    verificationLabel: "Última verificación",
    featuredOverline: "Torneo destacado",
    prizePool: "Prize Pool",
    entryFee: "Entry Fee",
    timeLeft: "Tiempo restante",
    players: "Jugadores",
    joinFeatured: "Pagar y jugar con WLD",
    tournamentsOverline: "Torneos",
    tournamentsTitle: "Hub de torneos automáticos",
    tabOpen: "Abiertos",
    tabActive: "En curso",
    tabFinished: "Finalizados",
    leaderboardOverline: "Leaderboard",
    leaderboardTitle: "Top 20 jugadores",
    questionOverline: "Pregunta en vivo",
    questionTitle: "Ronda 50x15",
    potLabel: "Premio acumulado",
    questionTotal: "Tiempo total {seconds}s",
    questionProgress: "Pregunta {number} de {total}",
    statusOpen: "Abierto",
    statusActive: "En curso",
    statusFinished: "Finalizado",
    cardTag: "Torneo",
    cardHistoric: "Histórico",
    joinTournament: "Unirse al torneo",
    viewTournament: "Ver detalle",
    timeLive: "En vivo",
    answerWindowClosed: "Ventana cerrada: no se puede responder.",
    answerWindowEarly: "Espera a que se abra la ventana de respuesta.",
    answerNeedAuth: "Autentica con World ID antes de responder.",
    backendEarly: "Backend: intentaste responder antes de los 10s.",
    backendLate: "Backend: llegaste después de 0s.",
    backendRate: "Backend: demasiados intentos en la misma pregunta.",
    backendRejected: "Respuesta rechazada por el backend.",
    autoSubmit: "Envío automático al expirar el tiempo.",
    correctAnswer: "Respuesta correcta registrada.",
    wrongAnswer: "Respuesta registrada (incorrecta).",
    answerSendFailed: "No se pudo enviar la respuesta.",
    needSession: "Necesitas token de sesión activo.",
    minikitMissing: "MiniKit no instalado",
    verifyRejected: "El backend rechazó la verificación de World ID",
    verifyFail: "No se pudo verificar World ID. Intenta de nuevo.",
    verifySuccess: "Sesión autenticada y firmada.",
    verifyFallback: "Sesión simulada (dev).",
    payNeedAuth: "Autentica con World ID antes de pagar.",
    payStartFail: "No se pudo iniciar el pago ({reason}).",
    payInProgress: "Pago enviado, verificando en World App...",
    payFail: "Pago fallido o pendiente ({reason}).",
    payConfirmed: "Pago confirmado y entrada aplicada.",
    paySimulated: "Pago simulado en modo dev.",
    sseConnecting: "Conectando SSE...",
    sseConnected: "SSE en vivo",
    sseReconnecting: "SSE desconectado, reintentando...",
    tickInvalid: "Firma de tiempo no válida: ignorando evento.",
    tickRejected: "Tick rechazado por firma inválida.",
    answerTooEarly: "Respuesta bloqueada hasta los 10s restantes.",
    leaderboardTime: "{seconds}s",
    correctLabel: "Aciertos {value}",
    payoutLabel: "Payout:",
    payoutSimulated: "(simulado)",
    payoutExplorer: "Ver en explorer",
  },
    en: {
    brandOverline: "World Chain",
    brandTitle: "50x15 Trivia Arena",
    connectButton: "Connect with Worldcoin",
    heroOverline: "Millionaire-style trivia",
    heroTitle: "Synced tournaments, WLD payments, and World ID verification",
    heroSubtitle:
      "Play 15-question rounds with 14s timers, WLD payments, and live rankings on World Chain. MiniKit handles auth, payments, and auditability.",
    badgeCron: "6h cron",
    badgePrize: "On-chain prize pool",
    badgeAnti: "Anti-cheat timing",
    walletLabel: "Wallet (World App)",
    sessionLabel: "Session status",
    verificationLabel: "Last verification",
    featuredOverline: "Featured tournament",
    prizePool: "Prize Pool",
    entryFee: "Entry Fee",
    timeLeft: "Time left",
    players: "Players",
    joinFeatured: "Pay and play with WLD",
    tournamentsOverline: "Tournaments",
    tournamentsTitle: "Automated tournaments hub",
    tabOpen: "Open",
    tabActive: "In progress",
    tabFinished: "Finished",
    leaderboardOverline: "Leaderboard",
    leaderboardTitle: "Top 20 players",
    questionOverline: "Live question",
    questionTitle: "50x15 round",
    potLabel: "Accumulated prize",
    questionTotal: "Total time {seconds}s",
    questionProgress: "Question {number} of {total}",
    statusOpen: "Open",
    statusActive: "Active",
    statusFinished: "Finished",
    cardTag: "Tournament",
    cardHistoric: "Historic",
    joinTournament: "Join tournament",
    viewTournament: "View details",
    timeLive: "Live",
    answerWindowClosed: "Window closed: cannot answer.",
    answerWindowEarly: "Wait until the answer window opens.",
    answerNeedAuth: "Authenticate with World ID before answering.",
    backendEarly: "Backend: answered before 10s.",
    backendLate: "Backend: answered after 0s.",
    backendRate: "Backend: too many attempts for this question.",
    backendRejected: "Answer rejected by backend.",
    autoSubmit: "Auto-submitted at timeout.",
    correctAnswer: "Correct answer recorded.",
    wrongAnswer: "Answer recorded (incorrect).",
    answerSendFailed: "Failed to send answer.",
    needSession: "You need an active session token.",
    minikitMissing: "MiniKit not installed",
    verifyRejected: "Backend rejected World ID verification",
    verifyFail: "World ID verification failed. Try again.",
    verifySuccess: "Session authenticated and signed.",
    verifyFallback: "Simulated session (dev).",
    payNeedAuth: "Authenticate with World ID before paying.",
    payStartFail: "Payment could not start ({reason}).",
    payInProgress: "Payment sent, verifying in World App...",
    payFail: "Payment failed or pending ({reason}).",
    payConfirmed: "Payment confirmed and entry applied.",
    paySimulated: "Payment simulated in dev mode.",
    sseConnecting: "Connecting SSE...",
    sseConnected: "SSE live",
    sseReconnecting: "SSE disconnected, retrying...",
    tickInvalid: "Invalid time signature: ignoring event.",
    tickRejected: "Tick rejected due to invalid signature.",
    answerTooEarly: "Answer locked until 10s remain.",
    leaderboardTime: "{seconds}s",
    correctLabel: "Correct {value}",
    payoutLabel: "Payout:",
    payoutSimulated: "(simulated)",
    payoutExplorer: "View on explorer",
  },
  fil: {
    brandOverline: "World Chain",
    brandTitle: "50x15 Trivia Arena",
    connectButton: "Kumonekta sa Worldcoin",
    heroOverline: "Trivia na estilo millonario",
    heroTitle: "Naka-sync na torneo, bayad sa WLD, at World ID",
    heroSubtitle:
      "Maglaro ng 15 tanong na may 14s timer, bayad sa WLD, at live ranking sa World Chain. Si MiniKit ang bahala sa auth, bayad, at audit.",
    badgeCron: "Cron bawat 6h",
    badgePrize: "Prize pool on-chain",
    badgeAnti: "Anti-cheat timing",
    walletLabel: "Wallet (World App)",
    sessionLabel: "Katayuan ng sesyon",
    verificationLabel: "Huling beripikasyon",
    featuredOverline: "Itinampok na torneo",
    prizePool: "Prize Pool",
    entryFee: "Entry Fee",
    timeLeft: "Natitirang oras",
    players: "Mga manlalaro",
    joinFeatured: "Magbayad at maglaro gamit ang WLD",
    tournamentsOverline: "Mga torneo",
    tournamentsTitle: "Hub ng awtomatikong torneo",
    tabOpen: "Bukas",
    tabActive: "Isinasagawa",
    tabFinished: "Tapos",
    leaderboardOverline: "Leaderboard",
    leaderboardTitle: "Top 20 manlalaro",
    questionOverline: "Tanong nang live",
    questionTitle: "Ronda 50x15",
    potLabel: "Naipong premyo",
    questionTotal: "Kabuuang oras {seconds}s",
    questionProgress: "Tanong {number} ng {total}",
    statusOpen: "Bukas",
    statusActive: "Aktibo",
    statusFinished: "Tapos",
    cardTag: "Torneo",
    cardHistoric: "Historikal",
    joinTournament: "Sumali sa torneo",
    viewTournament: "Tingnan ang detalye",
    timeLive: "Live",
    answerWindowClosed: "Sarado ang window: hindi makasagot.",
    answerWindowEarly: "Maghintay hanggang magbukas ang window.",
    answerNeedAuth: "Mag-verify sa World ID bago sumagot.",
    backendEarly: "Backend: sumagot bago ang 10s.",
    backendLate: "Backend: sumagot matapos ang 0s.",
    backendRate: "Backend: sobra ang pagtatangka sa tanong na ito.",
    backendRejected: "Tinanggihan ng backend ang sagot.",
    autoSubmit: "Auto-submit kapag natapos ang oras.",
    correctAnswer: "Naitala ang tamang sagot.",
    wrongAnswer: "Naitala ang maling sagot.",
    answerSendFailed: "Hindi naipadala ang sagot.",
    needSession: "Kailangan ang aktibong session token.",
    minikitMissing: "Hindi naka-install ang MiniKit",
    verifyRejected: "Tinanggihan ng backend ang World ID",
    verifyFail: "Bigo ang pag-verify ng World ID. Ulitin.",
    verifySuccess: "Na-authenticate ang sesyon.",
    verifyFallback: "Simulasyon ng sesyon (dev).",
    payNeedAuth: "Mag-verify sa World ID bago magbayad.",
    payStartFail: "Hindi masimulan ang bayad ({reason}).",
    payInProgress: "Naipadala ang bayad, bine-verify sa World App...",
    payFail: "Bigo o nakabinbin ang bayad ({reason}).",
    payConfirmed: "Kumpirmado ang bayad at naisama ang entry.",
    paySimulated: "Bayad na simulasyon sa dev mode.",
    sseConnecting: "Kumokonekta sa SSE...",
    sseConnected: "SSE live",
    sseReconnecting: "Na-disconnect ang SSE, nagre-retry...",
    tickInvalid: "Di-wastong lagda ng oras: isinasantabi.",
    tickRejected: "Tinanggihan ang tick: lagda di-wasto.",
    answerTooEarly: "Naka-lock ang sagot hanggang 10s nalang.",
    leaderboardTime: "{seconds}s",
    correctLabel: "Tama {value}",
    payoutLabel: "Payout:",
    payoutSimulated: "(simulado)",
    payoutExplorer: "Tingnan sa explorer",
  },
  id: {
    brandOverline: "World Chain",
    brandTitle: "50x15 Trivia Arena",
    connectButton: "Hubungkan Worldcoin",
    heroOverline: "Trivia ala millionaire",
    heroTitle: "Turnamen tersinkron, pembayaran WLD, verifikasi World ID",
    heroSubtitle:
      "Mainkan 15 pertanyaan dengan timer 14s, pembayaran WLD, dan peringkat langsung di World Chain. MiniKit mengurus auth, pembayaran, dan audit.",
    badgeCron: "Cron tiap 6 jam",
    badgePrize: "Prize pool on-chain",
    badgeAnti: "Timing anti-cheat",
    walletLabel: "Wallet (World App)",
    sessionLabel: "Status sesi",
    verificationLabel: "Verifikasi terakhir",
    featuredOverline: "Turnamen unggulan",
    prizePool: "Prize Pool",
    entryFee: "Biaya masuk",
    timeLeft: "Sisa waktu",
    players: "Pemain",
    joinFeatured: "Bayar & main dengan WLD",
    tournamentsOverline: "Turnamen",
    tournamentsTitle: "Hub turnamen otomatis",
    tabOpen: "Dibuka",
    tabActive: "Berjalan",
    tabFinished: "Selesai",
    leaderboardOverline: "Leaderboard",
    leaderboardTitle: "20 pemain teratas",
    questionOverline: "Pertanyaan langsung",
    questionTitle: "Ronde 50x15",
    potLabel: "Hadiah terkumpul",
    questionTotal: "Total waktu {seconds}dtk",
    questionProgress: "Pertanyaan {number} dari {total}",
    statusOpen: "Dibuka",
    statusActive: "Aktif",
    statusFinished: "Selesai",
    cardTag: "Turnamen",
    cardHistoric: "Historis",
    joinTournament: "Ikut turnamen",
    viewTournament: "Lihat detail",
    timeLive: "Live",
    answerWindowClosed: "Jendela tertutup: tidak bisa menjawab.",
    answerWindowEarly: "Tunggu hingga jendela jawaban dibuka.",
    answerNeedAuth: "Verifikasi World ID sebelum menjawab.",
    backendEarly: "Backend: menjawab sebelum 10dtk.",
    backendLate: "Backend: menjawab setelah 0dtk.",
    backendRate: "Backend: terlalu banyak percobaan di pertanyaan ini.",
    backendRejected: "Jawaban ditolak backend.",
    autoSubmit: "Auto-submit saat waktu habis.",
    correctAnswer: "Jawaban benar tercatat.",
    wrongAnswer: "Jawaban tercatat (salah).",
    answerSendFailed: "Gagal mengirim jawaban.",
    needSession: "Perlu token sesi aktif.",
    minikitMissing: "MiniKit tidak terpasang",
    verifyRejected: "Backend menolak verifikasi World ID",
    verifyFail: "Verifikasi World ID gagal. Coba lagi.",
    verifySuccess: "Sesi terautentikasi.",
    verifyFallback: "Sesi simulasi (dev).",
    payNeedAuth: "Verifikasi World ID sebelum membayar.",
    payStartFail: "Pembayaran gagal dimulai ({reason}).",
    payInProgress: "Pembayaran dikirim, verifikasi di World App...",
    payFail: "Pembayaran gagal/tertunda ({reason}).",
    payConfirmed: "Pembayaran dikonfirmasi dan entri diterapkan.",
    paySimulated: "Pembayaran simulasi di mode dev.",
    sseConnecting: "Menghubungkan SSE...",
    sseConnected: "SSE live",
    sseReconnecting: "SSE terputus, mencoba lagi...",
    tickInvalid: "Tanda waktu tidak valid: diabaikan.",
    tickRejected: "Tick ditolak: tanda tidak valid.",
    answerTooEarly: "Jawaban terkunci sampai tersisa 10dtk.",
    leaderboardTime: "{seconds}dtk",
    correctLabel: "Benar {value}",
    payoutLabel: "Payout:",
    payoutSimulated: "(simulasi)",
    payoutExplorer: "Lihat di explorer",
  },
  th: {
    brandOverline: "World Chain",
    brandTitle: "50x15 Trivia Arena",
    connectButton: "เชื่อมต่อกับ Worldcoin",
    heroOverline: "เกมถามตอบสไตล์เศรษฐี",
    heroTitle: "ทัวร์นาเมนต์ซิงก์ จ่าย WLD และยืนยัน World ID",
    heroSubtitle:
      "เล่น 15 คำถามพร้อมตัวจับเวลา 14 วินาที จ่าย WLD และตารางสดบน World Chain MiniKit จัดการยืนยัน ชำระเงิน และตรวจสอบได้.",
    badgeCron: "Cron ทุก 6ชม.",
    badgePrize: "Prize pool on-chain",
    badgeAnti: "จับเวลาป้องกันโกง",
    walletLabel: "กระเป๋า (World App)",
    sessionLabel: "สถานะเซสชัน",
    verificationLabel: "การยืนยันล่าสุด",
    featuredOverline: "ทัวร์นาเมนต์แนะนำ",
    prizePool: "Prize Pool",
    entryFee: "ค่าเข้า",
    timeLeft: "เวลาที่เหลือ",
    players: "ผู้เล่น",
    joinFeatured: "จ่ายและเล่นด้วย WLD",
    tournamentsOverline: "ทัวร์นาเมนต์",
    tournamentsTitle: "ศูนย์รวมทัวร์นาเมนต์อัตโนมัติ",
    tabOpen: "เปิดอยู่",
    tabActive: "กำลังเล่น",
    tabFinished: "จบแล้ว",
    leaderboardOverline: "ตารางผู้นำ",
    leaderboardTitle: "20 ผู้เล่นอันดับแรก",
    questionOverline: "คำถามสด",
    questionTitle: "รอบ 50x15",
    potLabel: "เงินรางวัลสะสม",
    questionTotal: "เวลารวม {seconds}วิ",
    questionProgress: "คำถาม {number} จาก {total}",
    statusOpen: "เปิดอยู่",
    statusActive: "กำลังเล่น",
    statusFinished: "จบแล้ว",
    cardTag: "ทัวร์นาเมนต์",
    cardHistoric: "ย้อนหลัง",
    joinTournament: "เข้าร่วมทัวร์นาเมนต์",
    viewTournament: "ดูรายละเอียด",
    timeLive: "ถ่ายทอดสด",
    answerWindowClosed: "หมดเวลาตอบแล้ว.",
    answerWindowEarly: "รอจนกว่าจะเปิดช่วงตอบ.",
    answerNeedAuth: "ยืนยัน World ID ก่อนตอบ.",
    backendEarly: "ตอบก่อน 10วิ.",
    backendLate: "ตอบหลัง 0วิ.",
    backendRate: "พยายามตอบมากเกินไป.",
    backendRejected: "ระบบปฏิเสธคำตอบ.",
    autoSubmit: "ส่งอัตโนมัติเมื่อหมดเวลา.",
    correctAnswer: "บันทึกคำตอบถูกต้องแล้ว.",
    wrongAnswer: "บันทึกคำตอบ (ผิด).",
    answerSendFailed: "ส่งคำตอบไม่สำเร็จ.",
    needSession: "ต้องมีโทเคนเซสชัน.",
    minikitMissing: "ไม่ได้ติดตั้ง MiniKit",
    verifyRejected: "แบ็กเอนด์ปฏิเสธการยืนยัน World ID",
    verifyFail: "ยืนยัน World ID ไม่สำเร็จ ลองใหม่.",
    verifySuccess: "ยืนยันเซสชันแล้ว.",
    verifyFallback: "เซสชันจำลอง (dev).",
    payNeedAuth: "ยืนยัน World ID ก่อนจ่าย.",
    payStartFail: "เริ่มจ่ายเงินไม่สำเร็จ ({reason}).",
    payInProgress: "ส่งการชำระเงินแล้ว กำลังตรวจสอบ...",
    payFail: "ชำระเงินล้มเหลือ/รอดำเนินการ ({reason}).",
    payConfirmed: "ยืนยันการชำระเงินและลงทะเบียนแล้ว.",
    paySimulated: "การชำระเงินจำลองในโหมด dev.",
    sseConnecting: "กำลังเชื่อม SSE...",
    sseConnected: "SSE สด",
    sseReconnecting: "SSE หลุด เชื่อมใหม่...",
    tickInvalid: "ลายเซ็นเวลาไม่ถูกต้อง: ข้าม.",
    tickRejected: "ปฏิเสธ tick: ลายเซ็นไม่ถูกต้อง.",
    answerTooEarly: "ล็อกคำตอบจนเหลือ 10วิ.",
    leaderboardTime: "{seconds}วิ",
    correctLabel: "ถูก {value}",
    payoutLabel: "Payout:",
    payoutSimulated: "(จำลอง)",
    payoutExplorer: "ดูใน explorer",
  },
  de: {
    brandOverline: "World Chain",
    brandTitle: "50x15 Trivia Arena",
    connectButton: "Mit Worldcoin verbinden",
    heroOverline: "Quiz im Millionär-Stil",
    heroTitle: "Synchronisierte Turniere, WLD-Zahlungen und World-ID-Check",
    heroSubtitle:
      "Spiele 15 Fragen mit 14s-Timer, WLD-Zahlungen und Live-Ranking auf World Chain. MiniKit übernimmt Auth, Zahlungen und Audit.",
    badgeCron: "Cron alle 6h",
    badgePrize: "On-Chain Prize Pool",
    badgeAnti: "Anti-Cheat Timing",
    walletLabel: "Wallet (World App)",
    sessionLabel: "Sitzungsstatus",
    verificationLabel: "Letzte Verifizierung",
    featuredOverline: "Empfohlenes Turnier",
    prizePool: "Prize Pool",
    entryFee: "Startgebühr",
    timeLeft: "Verbleibende Zeit",
    players: "Spieler",
    joinFeatured: "Mit WLD zahlen und spielen",
    tournamentsOverline: "Turniere",
    tournamentsTitle: "Automatischer Turnier-Hub",
    tabOpen: "Offen",
    tabActive: "Laufend",
    tabFinished: "Beendet",
    leaderboardOverline: "Leaderboard",
    leaderboardTitle: "Top 20 Spieler",
    questionOverline: "Live-Frage",
    questionTitle: "50x15-Runde",
    potLabel: "Gesammelter Jackpot",
    questionTotal: "Gesamtzeit {seconds}s",
    questionProgress: "Frage {number} von {total}",
    statusOpen: "Offen",
    statusActive: "Aktiv",
    statusFinished: "Beendet",
    cardTag: "Turnier",
    cardHistoric: "Historisch",
    joinTournament: "Am Turnier teilnehmen",
    viewTournament: "Details ansehen",
    timeLive: "Live",
    answerWindowClosed: "Zeitfenster geschlossen.",
    answerWindowEarly: "Warte bis das Antwortfenster öffnet.",
    answerNeedAuth: "Mit World ID authentifizieren.",
    backendEarly: "Backend: Antwort vor 10s.",
    backendLate: "Backend: Antwort nach 0s.",
    backendRate: "Backend: zu viele Versuche.",
    backendRejected: "Antwort vom Backend abgelehnt.",
    autoSubmit: "Automatisch bei Timeout gesendet.",
    correctAnswer: "Richtige Antwort gespeichert.",
    wrongAnswer: "Antwort gespeichert (falsch).",
    answerSendFailed: "Antwort senden fehlgeschlagen.",
    needSession: "Aktives Session-Token nötig.",
    minikitMissing: "MiniKit nicht installiert",
    verifyRejected: "Backend hat World ID abgelehnt",
    verifyFail: "World ID Verifizierung fehlgeschlagen.",
    verifySuccess: "Session authentifiziert.",
    verifyFallback: "Simulation (Dev).",
    payNeedAuth: "Mit World ID authentifizieren vor Zahlung.",
    payStartFail: "Zahlung konnte nicht starten ({reason}).",
    payInProgress: "Zahlung gesendet, wird geprüft...",
    payFail: "Zahlung fehlgeschlagen/ausstehend ({reason}).",
    payConfirmed: "Zahlung bestätigt, Eintritt verbucht.",
    paySimulated: "Simulation im Dev-Modus.",
    sseConnecting: "SSE wird verbunden...",
    sseConnected: "SSE live",
    sseReconnecting: "SSE getrennt, neuer Versuch...",
    tickInvalid: "Ungültige Zeit-Signatur.",
    tickRejected: "Tick abgelehnt (Signatur).",
    answerTooEarly: "Antwort gesperrt bis 10s.",
    leaderboardTime: "{seconds}s",
    correctLabel: "Richtig {value}",
    payoutLabel: "Auszahlung:",
    payoutSimulated: "(simuliert)",
    payoutExplorer: "Im Explorer ansehen",
  },
  ms: {
    brandOverline: "World Chain",
    brandTitle: "50x15 Trivia Arena",
    connectButton: "Sambung dengan Worldcoin",
    heroOverline: "Trivia gaya jutawan",
    heroTitle: "Tornamen terselaras, bayaran WLD, pengesahan World ID",
    heroSubtitle:
      "Main 15 soalan dengan pemasa 14s, bayaran WLD, dan ranking langsung di World Chain. MiniKit urus auth, bayaran, audit.",
    badgeCron: "Cron setiap 6j",
    badgePrize: "Prize pool on-chain",
    badgeAnti: "Pemasa anti-penipuan",
    walletLabel: "Wallet (World App)",
    sessionLabel: "Status sesi",
    verificationLabel: "Verifikasi terakhir",
    featuredOverline: "Tornamen pilihan",
    prizePool: "Prize Pool",
    entryFee: "Yuran masuk",
    timeLeft: "Masa tinggal",
    players: "Pemain",
    joinFeatured: "Bayar & main dengan WLD",
    tournamentsOverline: "Tornamen",
    tournamentsTitle: "Hab tornamen automatik",
    tabOpen: "Dibuka",
    tabActive: "Berjalan",
    tabFinished: "Selesai",
    leaderboardOverline: "Papan pendahulu",
    leaderboardTitle: "20 pemain teratas",
    questionOverline: "Soalan langsung",
    questionTitle: "Pusingan 50x15",
    potLabel: "Hadiah terkumpul",
    questionTotal: "Masa keseluruhan {seconds}s",
    questionProgress: "Soalan {number} daripada {total}",
    statusOpen: "Dibuka",
    statusActive: "Aktif",
    statusFinished: "Selesai",
    cardTag: "Tornamen",
    cardHistoric: "Sejarah",
    joinTournament: "Sertai tornamen",
    viewTournament: "Lihat butiran",
    timeLive: "Live",
    answerWindowClosed: "Tetingkap ditutup.",
    answerWindowEarly: "Tunggu hingga dibuka.",
    answerNeedAuth: "Sahkan World ID sebelum menjawab.",
    backendEarly: "Jawab sebelum 10s.",
    backendLate: "Jawab selepas 0s.",
    backendRate: "Terlalu banyak percubaan.",
    backendRejected: "Jawapan ditolak backend.",
    autoSubmit: "Auto-hantar bila tamat masa.",
    correctAnswer: "Jawapan betul direkod.",
    wrongAnswer: "Jawapan direkod (salah).",
    answerSendFailed: "Gagal hantar jawapan.",
    needSession: "Perlu token sesi aktif.",
    minikitMissing: "MiniKit tidak dipasang",
    verifyRejected: "Backend tolak World ID",
    verifyFail: "Pengesahan World ID gagal.",
    verifySuccess: "Sesi diautentikasi.",
    verifyFallback: "Sesi simulasi (dev).",
    payNeedAuth: "Sahkan World ID sebelum bayar.",
    payStartFail: "Bayaran gagal dimulakan ({reason}).",
    payInProgress: "Bayaran dihantar, semakan...",
    payFail: "Bayaran gagal/tertunda ({reason}).",
    payConfirmed: "Bayaran disahkan dan kemasukan disimpan.",
    paySimulated: "Bayaran simulasi (dev).",
    sseConnecting: "Menyambung SSE...",
    sseConnected: "SSE live",
    sseReconnecting: "SSE terputus, cuba lagi...",
    tickInvalid: "Tandatangan masa tidak sah.",
    tickRejected: "Tick ditolak (tandatangan).",
    answerTooEarly: "Jawapan dikunci hingga 10s.",
    leaderboardTime: "{seconds}s",
    correctLabel: "Betul {value}",
    payoutLabel: "Payout:",
    payoutSimulated: "(simulasi)",
    payoutExplorer: "Lihat di explorer",
  },
  ko: {
    brandOverline: "World Chain",
    brandTitle: "50x15 Trivia Arena",
    connectButton: "Worldcoin 연결",
    heroOverline: "백만장자 스타일 퀴즈",
    heroTitle: "동기화 토너먼트, WLD 결제, World ID",
    heroSubtitle:
      "14초 타이머 15문항, WLD 결제, World Chain 라이브 순위. MiniKit이 인증·결제·감사를 처리합니다.",
    badgeCron: "6시간 크론",
    badgePrize: "온체인 상금풀",
    badgeAnti: "안티치트 타이밍",
    walletLabel: "월렛 (World App)",
    sessionLabel: "세션 상태",
    verificationLabel: "마지막 검증",
    featuredOverline: "추천 토너먼트",
    prizePool: "Prize Pool",
    entryFee: "참가비",
    timeLeft: "남은 시간",
    players: "플레이어",
    joinFeatured: "WLD로 결제 후 플레이",
    tournamentsOverline: "토너먼트",
    tournamentsTitle: "자동 토너먼트 허브",
    tabOpen: "오픈",
    tabActive: "진행 중",
    tabFinished: "종료",
    leaderboardOverline: "리더보드",
    leaderboardTitle: "상위 20명",
    questionOverline: "라이브 문제",
    questionTitle: "50x15 라운드",
    potLabel: "누적 상금",
    questionTotal: "총 시간 {seconds}s",
    questionProgress: "문제 {number}/{total}",
    statusOpen: "오픈",
    statusActive: "진행",
    statusFinished: "종료",
    cardTag: "토너먼트",
    cardHistoric: "기록",
    joinTournament: "토너먼트 참여",
    viewTournament: "세부정보",
    timeLive: "라이브",
    answerWindowClosed: "답변 창이 닫혔습니다.",
    answerWindowEarly: "답변 창이 열릴 때까지 기다려주세요.",
    answerNeedAuth: "World ID 인증 후 답변하세요.",
    backendEarly: "10초 이전에 답변했습니다.",
    backendLate: "0초 이후에 답변했습니다.",
    backendRate: "시도 횟수 초과.",
    backendRejected: "백엔드에서 거부되었습니다.",
    autoSubmit: "시간 만료 시 자동 제출.",
    correctAnswer: "정답이 기록되었습니다.",
    wrongAnswer: "답변이 기록되었습니다 (오답).",
    answerSendFailed: "답변 전송 실패.",
    needSession: "세션 토큰이 필요합니다.",
    minikitMissing: "MiniKit이 설치되지 않음",
    verifyRejected: "백엔드가 World ID를 거부했습니다.",
    verifyFail: "World ID 검증 실패. 다시 시도.",
    verifySuccess: "세션 인증 완료.",
    verifyFallback: "시뮬레이션 세션 (dev).",
    payNeedAuth: "World ID 인증 후 결제하세요.",
    payStartFail: "결제를 시작할 수 없습니다 ({reason}).",
    payInProgress: "결제 전송, World App에서 확인 중...",
    payFail: "결제 실패/대기 ({reason}).",
    payConfirmed: "결제 확인, 참가 적용.",
    paySimulated: "개발 모드 시뮬레이션 결제.",
    sseConnecting: "SSE 연결 중...",
    sseConnected: "SSE 라이브",
    sseReconnecting: "SSE 끊김, 재시도...",
    tickInvalid: "잘못된 시간 서명: 무시.",
    tickRejected: "서명 오류로 tick 거부.",
    answerTooEarly: "10초 남을 때까지 잠김.",
    leaderboardTime: "{seconds}s",
    correctLabel: "정답 {value}",
    payoutLabel: "지급:",
    payoutSimulated: "(시뮬레이션)",
    payoutExplorer: "익스플로러에서 보기",
  },
  zh: {
    brandOverline: "World Chain",
    brandTitle: "50x15 Trivia Arena",
    connectButton: "连接 Worldcoin",
    heroOverline: "百万富翁风格问答",
    heroTitle: "同步锦标赛、WLD 支付与 World ID 验证",
    heroSubtitle:
      "进行 15 道题、14 秒计时的比赛，使用 WLD 支付并在 World Chain 上实时排名。MiniKit 负责认证、支付和审计。",
    badgeCron: "每 6 小时任务",
    badgePrize: "链上奖池",
    badgeAnti: "防作弊计时",
    walletLabel: "钱包 (World App)",
    sessionLabel: "会话状态",
    verificationLabel: "上次验证",
    featuredOverline: "推荐锦标赛",
    prizePool: "奖池",
    entryFee: "报名费",
    timeLeft: "剩余时间",
    players: "玩家",
    joinFeatured: "使用 WLD 支付并游玩",
    tournamentsOverline: "锦标赛",
    tournamentsTitle: "自动锦标赛中心",
    tabOpen: "开放",
    tabActive: "进行中",
    tabFinished: "已结束",
    leaderboardOverline: "排行榜",
    leaderboardTitle: "前 20 名玩家",
    questionOverline: "实时题目",
    questionTitle: "50x15 回合",
    potLabel: "累积奖池",
    questionTotal: "总时间 {seconds}s",
    questionProgress: "第 {number} 题，共 {total} 题",
    statusOpen: "开放",
    statusActive: "进行中",
    statusFinished: "已结束",
    cardTag: "锦标赛",
    cardHistoric: "历史",
    joinTournament: "加入锦标赛",
    viewTournament: "查看详情",
    timeLive: "直播",
    answerWindowClosed: "答题窗口已关闭。",
    answerWindowEarly: "等待答题窗口开启。",
    answerNeedAuth: "先用 World ID 验证后再答题。",
    backendEarly: "10 秒前答题。",
    backendLate: "0 秒后答题。",
    backendRate: "尝试次数过多。",
    backendRejected: "后台拒绝了答案。",
    autoSubmit: "时间到自动提交。",
    correctAnswer: "正确答案已记录。",
    wrongAnswer: "答案已记录（错误）。",
    answerSendFailed: "发送答案失败。",
    needSession: "需要有效会话令牌。",
    minikitMissing: "未安装 MiniKit",
    verifyRejected: "后台拒绝了 World ID 验证",
    verifyFail: "World ID 验证失败，请重试。",
    verifySuccess: "会话已认证。",
    verifyFallback: "开发模式模拟会话。",
    payNeedAuth: "支付前先验证 World ID。",
    payStartFail: "无法发起支付（{reason}）。",
    payInProgress: "支付已发送，World App 验证中...",
    payFail: "支付失败/待定（{reason}）。",
    payConfirmed: "支付已确认，入场已应用。",
    paySimulated: "开发模式下的模拟支付。",
    sseConnecting: "SSE 连接中...",
    sseConnected: "SSE 已连接",
    sseReconnecting: "SSE 断开，正在重试...",
    tickInvalid: "时间签名无效：已忽略。",
    tickRejected: "签名无效，tick 被拒绝。",
    answerTooEarly: "剩余 10 秒前无法答题。",
    leaderboardTime: "{seconds}s",
    correctLabel: "正确 {value}",
    payoutLabel: "派彩:",
    payoutSimulated: "(模拟)",
    payoutExplorer: "在浏览器查看",
  },
  ja: {
    brandOverline: "World Chain",
    brandTitle: "50x15 Trivia Arena",
    connectButton: "Worldcoin に接続",
    heroOverline: "ミリオネア風トリビア",
    heroTitle: "同期トーナメント、WLD決済、World ID検証",
    heroSubtitle:
      "14秒タイマーの15問、WLD決済、World Chainのライブランキング。MiniKitが認証・決済・監査を処理します。",
    badgeCron: "6時間ごと Cron",
    badgePrize: "オンチェーン賞金",
    badgeAnti: "チート防止タイミング",
    walletLabel: "ウォレット (World App)",
    sessionLabel: "セッション状態",
    verificationLabel: "最終検証",
    featuredOverline: "注目トーナメント",
    prizePool: "賞金プール",
    entryFee: "参加費",
    timeLeft: "残り時間",
    players: "プレイヤー",
    joinFeatured: "WLDで支払い参加",
    tournamentsOverline: "トーナメント",
    tournamentsTitle: "自動トーナメントハブ",
    tabOpen: "受付中",
    tabActive: "進行中",
    tabFinished: "終了",
    leaderboardOverline: "リーダーボード",
    leaderboardTitle: "トップ20プレイヤー",
    questionOverline: "ライブ問題",
    questionTitle: "50x15ラウンド",
    potLabel: "累積賞金",
    questionTotal: "合計時間 {seconds}秒",
    questionProgress: "質問 {number}/{total}",
    statusOpen: "受付中",
    statusActive: "進行中",
    statusFinished: "終了",
    cardTag: "トーナメント",
    cardHistoric: "履歴",
    joinTournament: "トーナメント参加",
    viewTournament: "詳細を見る",
    timeLive: "ライブ",
    answerWindowClosed: "回答ウィンドウは閉じています。",
    answerWindowEarly: "回答ウィンドウが開くまで待ってください。",
    answerNeedAuth: "回答前に World ID を認証してください。",
    backendEarly: "10秒前に回答しました。",
    backendLate: "0秒後に回答しました。",
    backendRate: "試行回数が多すぎます。",
    backendRejected: "バックエンドに拒否されました。",
    autoSubmit: "タイムアウトで自動送信。",
    correctAnswer: "正解を記録しました。",
    wrongAnswer: "回答を記録しました (不正解)。",
    answerSendFailed: "回答の送信に失敗しました。",
    needSession: "有効なセッショントークンが必要です。",
    minikitMissing: "MiniKit がインストールされていません",
    verifyRejected: "バックエンドが World ID を拒否",
    verifyFail: "World ID 検証に失敗。再試行してください。",
    verifySuccess: "セッション認証済み。",
    verifyFallback: "開発モードのシミュレーションセッション。",
    payNeedAuth: "支払い前に World ID を認証してください。",
    payStartFail: "支払い開始に失敗 ({reason})。",
    payInProgress: "支払い送信、World App で確認中...",
    payFail: "支払い失敗/保留 ({reason})。",
    payConfirmed: "支払い確認、参加適用済み。",
    paySimulated: "開発モードでの支払いシミュレーション。",
    sseConnecting: "SSE 接続中...",
    sseConnected: "SSE ライブ",
    sseReconnecting: "SSE 切断、再試行中...",
    tickInvalid: "タイム署名が無効: 無視。",
    tickRejected: "署名無効で tick 拒否。",
    answerTooEarly: "残り10秒までロック。",
    leaderboardTime: "{seconds}秒",
    correctLabel: "正解 {value}",
    payoutLabel: "支払い:",
    payoutSimulated: "(シミュレーション)",
    payoutExplorer: "Explorerで見る",
  },
};

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
