# Auditoría actualizada 50x15 (post-remediación)

Estado tras aplicar el contrato 14→10 (mostrar) y 10→0 (responder), reforzar backend y pagos persistentes.

## A. Tiempos y sincronización
- **Qué hace ahora**: El backend define `startTimestamp`, `answerWindowOpensAt = +4s` y `deadline = +14s` y los envía por SSE junto con ticks de reloj de servidor. El frontend corrige deriva (`serverOffsetMs`) y usa `serverNow()` para animar el typewriter (14→10) y revelar opciones 1s c/u hasta el segundo 10. Botones solo se habilitan al cruzar `answerWindowOpensAt` y se autoenvía a 0s.【F:backend/src/game-session.ts†L4-L69】【F:backend/src/question-stream.ts†L4-L37】【F:frontend/main.js†L96-L199】【F:frontend/main.js†L234-L314】
- **Gaps previos cerrados**: Dependencia de `Date.now()` local para habilitar botones, falta de offset de servidor y falta de campo de apertura de ventana. Ahora la ventana (10→0) está validada en servidor y reflejada en UI.
- **Pendiente**: No hay reconciliación si el cliente pierde ticks largos (se cae a modo demo), ni reloj criptográficamente firmado.
- **Puntuación**: 92/100.

## B. Validación backend
- **Qué hace ahora**: `validateAnswerWindow` rechaza cualquier respuesta antes de `answerWindowOpensAt` (10s) o después del `deadline`. `submit-answer` calcula `answerTime` con reloj de servidor, marca `<500ms` como sospechoso y almacena el timestamp del cliente solo como referencia.【F:backend/src/game-session.ts†L71-L115】【F:backend/src/submit-answer.ts†L12-L82】
- **Gaps cerrados**: Validación ya no depende del timestamp del cliente; se añade campo `clientAnsweredAt` y hash con tiempo de servidor.
- **Pendiente**: Falta rate limiting y almacenamiento duradero de sospechosos.
- **Puntuación**: 88/100.

## C. Anti-cheat / DOM
- **Qué hace ahora**: Opciones siguen sin estar en el DOM hasta su revelado; `user-select: none` y feedback de bloqueo por tiempo en UI. El backend valida hash de pregunta y orden de pregunta.【F:frontend/index.css†L1-L31】【F:frontend/main.js†L234-L314】【F:backend/src/submit-answer.ts†L29-L47】
- **Gaps cerrados**: Se muestra mensaje cuando se intenta responder antes de 10s o después de 0s.
- **Pendiente**: Sin firma de eventos SSE ni ofuscación adicional de opciones.
- **Puntuación**: 75/100.

## D. Pagos MiniKit y estados
- **Qué hace ahora**: `initiate-payment` y `confirm-payment` persisten referencias y estados en disco (`data/state.json`). UI muestra estados "en curso", "confirmado" o "fallido". Entradas confirmadas incrementan prize pool y jugadores.【F:backend/src/payment-store.ts†L1-L56】【F:backend/src/initiate-payment.ts†L5-L23】【F:backend/src/confirm-payment.ts†L11-L71】【F:frontend/main.js†L346-L405】
- **Gaps cerrados**: Ya no se pierden pagos al reiniciar el servidor; la UI refleja fallos.
- **Pendiente**: Integración real con `/api/v2/minikit/transaction` y manejo de reintentos firmados.
- **Puntuación**: 82/100.

## E. Prize pool y rake
- **Qué hace ahora**: Prize pool y rake se recalculan desde entradas confirmadas y se persisten con los torneos. Se exponen en UI en tiempo real tras cada confirmación.【F:backend/src/tournaments.ts†L1-L135】【F:frontend/main.js†L21-L88】
- **Gaps cerrados**: Evita reinicialización del pool; rake queda almacenado.
- **Pendiente**: Conciliación con contrato on-chain.
- **Puntuación**: 84/100.

## F. Ranking, torneos y carteras
- **Qué hace ahora**: Ranking ordena por aciertos y tiempo; payouts simulados persisten. Nuevo endpoint `/api/user/:wallet/history` devuelve jugados y ganados por cartera.【F:backend/src/tournaments.ts†L137-L216】【F:backend/index.ts†L32-L70】
- **Gaps cerrados**: Se puede consultar histórico básico y ganar/participar.
- **Pendiente**: Persistir respuestas por jugador y sync con wallets verificadas.
- **Puntuación**: 78/100.

## G. On-chain / Merkle
- **Qué hace ahora**: Merkle root y `payoutTxHash` sintéticos se persisten y quedan accesibles para futuras integraciones on-chain.【F:backend/src/tournaments.ts†L137-L181】
- **Pendiente**: Llamadas reales a contrato en World Chain y enlaces a explorer.
- **Puntuación**: 55/100.

## H. UX y feedback
- **Qué hace ahora**: Mensajes claros para respuestas fuera de ventana, SSE desconectado, pago en curso/fallido/confirmado, y autoenvío al expirar. Temporizador y progresión usan reloj de servidor para evitar drift visible.【F:frontend/main.js†L200-L314】【F:frontend/main.js†L315-L427】【F:frontend/index.html†L116-L139】
- **Gaps cerrados**: Falta de feedback ante rechazos de backend.
- **Pendiente**: Indicadores de reconexión SSE en toda la app y toasts diferenciados.
- **Puntuación**: 80/100.

## Conclusión
La app ahora cumple el contrato temporal 14→10 (mostrar) y 10→0 (responder) con validación de servidor, deriva corregida en cliente y rechazo firme en backend. Pagos y prize pool sobreviven reinicios y el usuario recibe feedback en tiempo real. Siguen abiertos: firma/autenticación de eventos, integración on-chain real y almacenamiento duradero de auditoría de fraude.
