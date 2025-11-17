# Auditoría integral 50x15 (World App Mini App)

Evaluación punto a punto contra los requisitos de sincronización, seguridad, pagos y publicación on-chain. Basado en el código actual de `frontend/main.js`, `frontend/index.html`, `frontend/index.css` y backend Express (en memoria) en `backend/src/*`.

## 1) Tiempo de escritura de la pregunta (typewriter 0–14s)
- **Estado**: Implementado. El efecto escribe en función del mismo `startTimestamp`/`deadline` usado por el temporizador, abarcando toda la ventana de 14s.【F:frontend/main.js†L198-L292】
- **Fallas**: No hay caída a servidor si el cliente se congela; se usa el tiempo local del navegador.
- **Mejoras**: Incluir sincronización con ticks de servidor (latido SSE) para corregir drift y cortar el typewriter si el servidor invalida la sesión.
- **Puntuación**: 80/100.

## 2) Aparición secuencial de opciones (4–8s, 1s c/u)
- **Estado**: Implementado. Cada botón se crea justo en su instante de revelado (`start+4s + index*1s`) y arranca deshabilitado, evitando presencia previa en el DOM.【F:frontend/main.js†L229-L257】
- **Fallas**: Usa `Date.now()` local para los cálculos; sin corrección por deriva. No valida con servidor que la revelación ocurrió a tiempo.
- **Mejoras**: Derivar retrasos del server time recibido por SSE y añadir confirmación/hashes por opción en el backend para auditar la secuencia.
- **Puntuación**: 85/100.

## 3) Habilitación y bloqueo de respuestas (botones 4s–14s)
- **Estado**: Implementado. Los botones se habilitan tras 4s y se bloquean si el `deadline` expira o después de la selección; auto-envío en el deadline.【F:frontend/main.js†L266-L305】
- **Backend**: El validador rechaza respuestas antes de 4s o después de 14s y marca la sesión como completada.【F:backend/src/game-session.ts†L95-L117】【F:backend/src/submit-answer.ts†L22-L82】
- **Fallas**: No devuelve feedback visual al usuario si el backend rechaza por ventana; el bloqueo depende del reloj local.
- **Mejoras**: Usar la hora del servidor al habilitar/deshabilitar y mostrar mensaje cuando la respuesta es rechazada por timing.
- **Puntuación**: 88/100.

## 4) Sincronización frontend-backend (pregunta y tiempo)
- **Estado**: Parcial. El frontend se conecta vía SSE a `/api/game/:id/question` y recibe `startTimestamp`/`deadline`/`nonce`; también hay eventos `tick` con tiempo de servidor.【F:backend/src/question-stream.ts†L4-L34】
- **Fallas**: El temporizador del cliente no se corrige con los ticks; solo se usan datos iniciales. No hay persistencia ni reintentos si la conexión SSE se cae.
- **Mejoras**: Aplicar delta de reloj usando los ticks SSE, reconectar con backoff y mover el cálculo del progreso a tiempo de servidor.
- **Puntuación**: 70/100.

## 5) Validación de respuestas en backend
- **Estado**: Implementado. El backend recibe `nonce`, `answeredAt`, `questionHash` y `questionNumber`, valida ventana temporal y hash, calcula `answerTime`, hash de respuesta y registra sospechosos.【F:backend/src/submit-answer.ts†L12-L82】
- **Fallas**: El almacenamiento es en memoria; no hay firma/verificación de integridad persistente ni escritura en D1/contract.
- **Mejoras**: Persistir registros con firma (HMAC) y añadir logging de auditoría a almacenamiento duradero/on-chain.
- **Puntuación**: 80/100.

## 6) Control de velocidad de respuesta (<500ms)
- **Estado**: Implementado. `validateAnswerWindow` y el cálculo de `answerTime` permiten marcar respuestas rápidas; se marca `suspicious` si <500ms.【F:backend/src/submit-answer.ts†L45-L80】
- **Fallas**: Solo etiqueta; no hay notificación ni bloqueo adicional, ni panel de revisión.
- **Mejoras**: Registrar en tabla de fraude, exponer endpoint de revisión y aplicar rate limiting adicional al usuario/nonce.
- **Puntuación**: 75/100.

## 7) Prevención de manipulación / anti-cheat
- **Estado**: Parcial. Opciones se crean on-demand; hay `user-select: none` y hashes de pregunta/opciones en backend.【F:frontend/index.css†L1-L31】【F:backend/src/game-session.ts†L38-L66】
- **Fallas**: Frontend aún confía en reloj local; SSE no se autentica; no hay firma de eventos ni verificación de secuencia multipregunta.
- **Mejoras**: Incluir JWT de sesión, firmar los eventos SSE, validar orden de preguntas en backend y añadir ofuscación de opciones antes del render.
- **Puntuación**: 65/100.

## 8) Proceso de pago con MiniKit
- **Estado**: Implementado (mock-friendly). Se crea referencia en backend, se invoca `MiniKit.commandsAsync.pay` y se confirma vía `/confirm-payment`, que valida contra Worldcoin si hay credenciales o simula en dev; al confirmar, se agrega la entrada al torneo y aumenta el pool.【F:frontend/main.js†L364-L404】【F:backend/src/initiate-payment.ts†L5-L23】【F:backend/src/confirm-payment.ts†L11-L71】【F:backend/src/tournaments.ts†L113-L120】
- **Fallas**: Sin persistencia ni manejo de reintentos/rediseño de estados; no se almacenan recibos firmados; falta UI de error detallado.
- **Mejoras**: Persistir pagos en D1, mostrar estados (pending/failed), y usar colas idempotentes para confirmaciones.
- **Puntuación**: 78/100.

## 9) Cálculo del prize pool y rake
- **Estado**: Implementado en backend y expuesto a frontend; suma entradas confirmadas, aplica rake fijo 10% y muestra prize pool en vivo.【F:backend/src/tournaments.ts†L94-L169】【F:frontend/main.js†L21-L85】
- **Fallas**: Datos solo en memoria; sin reconciliación con blockchain ni persistencia.
- **Mejoras**: Persistir en D1 y sincronizar con contrato de prize pool en World Chain para evitar divergencias.
- **Puntuación**: 80/100.

## 10) Distribución de premios y ranking
- **Estado**: Parcial. Ranking por aciertos/tiempo y splits 50/30/20; cron simulado cada 30s finaliza torneos, genera Merkle root y hashes de payout en memoria.【F:backend/src/tournaments.ts†L121-L181】【F:backend/index.ts†L68-L76】
- **Fallas**: Cron local no garantizado en producción; sin ejecución on-chain real ni persistencia.
- **Mejoras**: Migrar a cron de Cloudflare, escribir resultados en contrato y almacenar hashes/tx en base de datos.
- **Puntuación**: 65/100.

## 11) Publicación on-chain de resultados
- **Estado**: Parcial. Se generan `merkleRoot` y `payoutTxHash` sintéticos pero no se envían a World Chain ni se exponen enlaces en UI.【F:backend/src/tournaments.ts†L136-L169】【F:frontend/index.html†L106-L160】
- **Fallas**: Sin integración con contrato ni explorer; hashes no verificables.
- **Mejoras**: Emitir transacción real al finalizar, guardar hash y mostrar enlaces al explorer en leaderboard/detalle.
- **Puntuación**: 45/100.

## Resumen final
- **Alineación**: La sincronización core (typewriter 14s, revelado 4–8s, ventana 4–14s) está implementada y validada en backend, pero depende del reloj local y de almacenamiento en memoria. Pagos y prize pool funcionan en mock con lógica de rake y entradas, pero carecen de persistencia y on-chain real.
- **Gaps críticos antes de producción**:
  1. Persistencia y firmas: mover sesiones, pagos y respuestas a D1/contrato y firmar eventos SSE/HTTP.
  2. Corrección de reloj y resiliencia: aplicar delta de servidor a timers, reconexión SSE, y feedback visual ante rechazos de backend.
  3. On-chain real: integrar contrato de prize pool y escritura de Merkle roots/payouts en World Chain con enlaces de explorer.
  4. Anti-cheat avanzado: rate limiting, revisión de sospechosos <500ms, validación de secuencia multipregunta y ofuscación de opciones.
