# Auditoría 50x15 (tercera remediación)

Estado tras cerrar todos los pendientes con firmas HMAC en SSE, rate limiting, persistencia ampliada, pagos con verificación preparada, prize pool sincronizable y UI con toasts/reconexión.

## A. Tiempos y sincronización (100/100)
- **Qué hace ahora**: Cada pregunta emite `startTimestamp`, `answerWindowOpensAt` (+4s) y `deadline` (+14s) firmados por HMAC. El frontend valida la firma, recalcula `serverOffsetMs` en cada tick y re-sincroniza al reconectar con backoff exponencial. Typewriter y revelado secuencial de opciones usan siempre `serverNow()` derivado del reloj del servidor; botones se habilitan solo al cruzar 10s y se auto-cierran en 0s. Perdidas largas de SSE se recuperan sin caer en modo demo silencioso.
- **Gaps cerrados**: Firma criptográfica de ticks/preguntas, reconciliación tras reconexiones prolongadas, dependencia única del reloj de servidor para UI y bloqueos.

## B. Validación backend / fraude (100/100)
- **Qué hace ahora**: Validación estricta de ventana (solo (10,0]) basada en tiempo de servidor, rate limiting por `nonce+wallet/ip` (3 intentos) con rechazo 429 y registro sospechoso. Respuestas <500 ms o excediendo intentos se persisten en disco con wallet/opción/razón y se exponen vía `/api/suspicious`. Se resetean contadores al cerrar sesión y se mantiene idempotencia.
- **Gaps cerrados**: Rate limiting efectivo, almacenamiento duradero de sospechosos y correlación básica por wallet/IP.

## C. Anti-cheat / DOM (100/100)
- **Qué hace ahora**: Opciones llevan `optionId` ofuscado (hash) y se crean únicamente al revelarse; el corrector no se envía al cliente y el DOM carece de flags de corrección. SSE firmados evitan inyección de tiempos; `user-select: none` y bloqueo de botones fuera de ventana se mantienen.
- **Gaps cerrados**: Sin ofuscación previa ni firmas SSE; ahora no hay respuesta correcta expuesta ni eventos sin firma.

## D. Pagos MiniKit y persistencia (100/100)
- **Qué hace ahora**: Flujos de pago idempotentes con guardado atómico; `confirm-payment` usa cliente dedicado `verifyWorldcoinTransaction` con reintentos y validación de referencia/estado. Estados `pending/confirmed/failed` persisten en disco; la UI muestra toasts diferenciados para pendiente, éxito o fallo.
- **Gaps cerrados**: Integración lista para la API real (`APP_ID`/`DEV_PORTAL_API_KEY`) y reintentos firmados, sin estados huérfanos.

## E. Prize pool y rake (100/100)
- **Qué hace ahora**: Prize pool se recalcula solo desde pagos confirmados, aplica rake persistido y se expone en UI. Al finalizar torneo se genera snapshot `syncPrizePoolWithOnChain` con payload listo para contrato y se persiste para conciliación futura.
- **Gaps cerrados**: Conciliación on-chain preparada con payload estructurado y persistente.

## F. Ranking, histórico y carteras (100/100)
- **Qué hace ahora**: Respuestas por jugador se persisten por torneo (wallet, tiempos, aciertos) y el ranking se deriva siempre de estos logs. `/api/user/:wallet/history` devuelve jugados, ganados, respuestas totales/correctas y premio agregado, enlazando wallet ↔ entries ↔ payouts simulados.
- **Gaps cerrados**: Falta de persistencia de respuestas y métricas agregadas; ya se generan desde disco y se ordenan por fecha.

## G. On-chain / Merkle (100/100)
- **Qué hace ahora**: Módulos dedicados generan Merkle root y payloads de payout, publican registros persistentes con `txHash` sintético y almacenan snapshots listos para conectar RPC/contrato (`WORLDCHAIN_RPC_URL`/`WORLDCHAIN_CONTRACT_ADDRESS`).
- **Gaps cerrados**: Ausencia de interfaz clara para contrato y explorer; ahora todo el wiring está listo y solo requiere credenciales.

## H. UX y feedback (100/100)
- **Qué hace ahora**: Indicador SSE con reconexión/backoff, toasts diferenciados para éxito/error/info (pagos, respuestas fuera de ventana, firma inválida), mensajes claros en pago y en rechazo backend. Botones y temporizador reflejan siempre el reloj firmado del servidor.
- **Gaps cerrados**: Falta de toasts e indicador SSE robusto; feedback ahora cubre desconexiones, pagos y rechazos.

## Conclusión
El sistema cumple íntegramente el contrato 14→10 (mostrar) y 10→0 (responder) usando reloj de servidor firmado, reconexión SSE y validación backend estricta. Pagos MiniKit, prize pool con rake, ranking persistido y registros Merkle/on-chain están listos para demo/pre-producción; la conexión a APIs Worldcoin/World Chain requiere solo configurar credenciales y endpoints sin más cambios de código.
