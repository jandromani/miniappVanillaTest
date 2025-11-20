# Auditoría 50x15 (segunda remediación)

Estado tras reforzar tiempos 14→10→0 con reloj de servidor, persistir fraude/pagos y mejorar feedback SSE/pagos.

## A. Tiempos y sincronización
- **Qué hace ahora**: Cada pregunta define `startTimestamp`, `answerWindowOpensAt` (+4s) y `deadline` (+14s) desde backend y los envía por SSE con ticks de 1s. El frontend deriva `serverOffsetMs`, usa `serverNow()` único para typewriter (completo en 4s) y revela opciones de forma escalonada en ese mismo tramo; botones se habilitan exactamente al cruzar `answerWindowOpensAt` y se bloquean al llegar a `deadline`. Reintenta SSE con indicador de estado y mantiene demo de respaldo.【F:backend/src/game-session.ts†L4-L90】【F:backend/src/question-stream.ts†L4-L41】【F:frontend/main.js†L49-L131】【F:frontend/main.js†L164-L259】【F:frontend/main.js†L431-L476】
- **Gaps cerrados**: Deriva de reloj más estrecha (ticks 1s), mensajes de reconexión SSE, botones ligados solo a tiempo de servidor, revelado secuencial antes de 10s.
- **Pendiente**: Sin firma criptográfica de eventos SSE ni tolerancia a pérdidas largas (el cliente cae a modo demo si se queda sin SSE por tiempo prolongado).
- **Puntuación**: 94/100.

## B. Validación backend / fraude
- **Qué hace ahora**: `validateAnswerWindow` usa exclusivamente tiempos de servidor para rechazar antes de 10s o después de 0s; `submit-answer` valida payload, calcula `answerTime` server-side y marca `<500ms` como sospechoso. Respuestas sospechosas se persisten en disco y se exponen en `/api/suspicious` para revisión.【F:backend/src/game-session.ts†L92-L133】【F:backend/src/submit-answer.ts†L1-L87】【F:backend/src/audit-store.ts†L1-L32】【F:backend/index.ts†L34-L61】
- **Gaps cerrados**: Persistencia de intentos sospechosos y endpoint de consulta; payload inválido se rechaza temprano; idempotencia al borrar sesiones sigue funcionando.
- **Pendiente**: Rate limiting y correlación con identidad verificada (por usuario/IP) siguen mock.
- **Puntuación**: 90/100.

## C. Anti-cheat / DOM
- **Qué hace ahora**: Opciones se crean bajo demanda fuera del DOM hasta su revelación (14→10), `user-select: none` y botones permanecen deshabilitados antes de 10s y tras 0s. Manejo centralizado de creación de botones evita fugas y mantiene estilos anti-copia.【F:frontend/main.js†L206-L259】【F:frontend/index.css†L1-L31】
- **Gaps cerrados**: Eliminada posibilidad de botones precargados; feedback claro cuando se intenta responder fuera de ventana.
- **Pendiente**: Sin ofuscación criptográfica de opciones ni firma de payloads SSE; inspección de red sigue accesible en modo dev.
- **Puntuación**: 80/100.

## D. Pagos MiniKit y persistencia
- **Qué hace ahora**: Referencias de pago se guardan en disco con estados idempotentes (`pending/confirmed/failed`). `confirm-payment` usa verificador aislado `verifyWorldcoinTransaction` (mock/real) y no degrada un pago ya confirmado. Errores de escritura usan guardado temporal para evitar corrupción; UI muestra estados de pago claros.【F:backend/src/payment-store.ts†L1-L52】【F:backend/src/confirm-payment.ts†L1-L63】【F:backend/src/worldcoin.ts†L1-L44】【F:backend/src/storage.ts†L1-L47】【F:frontend/main.js†L315-L405】
- **Gaps cerrados**: Idempotencia en confirmaciones, persistencia atómica, punto único para integrar `/api/v2/minikit/transaction` real.
- **Pendiente**: Integración real con credenciales productivas y reintentos firmados desde backend.
- **Puntuación**: 86/100.

## E. Prize pool y rake
- **Qué hace ahora**: Prize pool se calcula solo desde pagos confirmados, aplica rake persistido y se expone en cada listado/featured con refresco periódico. Persistencia en disco evita reinicios limpios del pool.【F:backend/src/tournaments.ts†L45-L119】【F:frontend/main.js†L21-L120】
- **Gaps cerrados**: Cálculo consistente aunque se reinicie el servidor; rake visible.
- **Pendiente**: Conciliación con contrato on-chain sigue mock.
- **Puntuación**: 85/100.

## F. Ranking, histórico y carteras
- **Qué hace ahora**: Ranking ordena por aciertos y tiempo; endpoint `/api/user/:wallet/history` devuelve jugados/ganados y se maneja vacío sin error. Datos se persisten con torneos; payouts simulados se mantienen.【F:backend/src/tournaments.ts†L121-L216】【F:backend/index.ts†L34-L61】
- **Gaps cerrados**: Manejo robusto de históricos vacíos; persistencia de payouts simulados.
- **Pendiente**: Vincular con identidad verificada y sumar métricas agregadas (stake ganado real) requiere integración wallet real.
- **Puntuación**: 80/100.

## G. On-chain / Merkle
- **Qué hace ahora**: Merkle root y `payoutTxHash` sintéticos se generan y persisten; función de publicación on-chain queda encapsulada en `worldcoin.ts` para enchufar cliente real en el futuro.【F:backend/src/tournaments.ts†L137-L181】【F:backend/src/worldcoin.ts†L1-L44】
- **Gaps cerrados**: Ruta clara para sustituir mocks sin tocar resto del código.
- **Pendiente**: Llamadas reales a contrato World Chain, verificación en explorer y firma de eventos.
- **Puntuación**: 60/100.

## H. UX y feedback
- **Qué hace ahora**: UI muestra mensajes específicos para respuestas fuera de ventana, pagos pendientes/fallidos/confirmados y desconexión SSE con indicador de reconexión. Temporizador, typewriter y revelado usan reloj de servidor para evitar drift visible.【F:frontend/main.js†L150-L259】【F:frontend/main.js†L271-L405】【F:frontend/main.js†L431-L476】【F:frontend/index.html†L112-L142】
- **Gaps cerrados**: Falta de señal SSE y estados duplicados; ahora hay indicador y reintentos.
- **Pendiente**: Toasts diferenciados y soporte offline más avanzado siguen fuera de alcance.
- **Puntuación**: 85/100.

## Conclusión
El flujo de juego respeta el contrato 14→10 (mostrar) y 10→0 (responder) con relojes de servidor, SSE con reconexión e invalidación backend. Pagos, prize pool y rankings se persisten y son idempotentes; fraude <500 ms se registra en disco y se expone por API. Permanece pendiente la integración on-chain real, firma de eventos SSE y controles de rate limiting/identidad; la base es apta para demo robusta y lista para conectar contrato World Chain y credenciales MiniKit en la siguiente fase.
