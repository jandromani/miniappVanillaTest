# Informe World ID (estado tras refuerzo)

## Resumen ejecutivo
World ID se verifica ahora exclusivamente del lado servidor usando `verifyCloudProof` cuando hay credenciales y bloqueando el modo mock en producción. Cada verificación exige `action/signal` esperados, liga `worldId` (nullifier) y `wallet` a un token de sesión HMAC con expiración, y registra la prueba en un store persistente para anti-replay y anti-sybil. Las rutas críticas (pagos, respuestas) requieren ese token y rechazan solicitudes sin `worldId`; los nullifiers se deduplican por acción y se evita la reutilización de pruebas o cambios de wallet. Solo se guardan identificadores mínimos (worldId, wallet, timestamps) en disco, sin payload completo de la prueba.

## Detalle por puntos
1) **Verify frontend**
- Ahora el frontend solo marca la sesión como válida si el backend responde OK; en fallos no se activa modo mock y se muestra error.
- El token devuelto se almacena en memoria y se envía en headers en pagos/respuestas.

2) **Verify backend**
- `/verify` valida `action/signal` contra configuración, exige `worldId` y `wallet`, rechaza pruebas sin `APP_ID` en producción y llama a `verifyCloudProof` con los parámetros esperados.
- Si `worldId` ya usó una prueba para la misma acción o la wallet no coincide con la vinculada, se rechaza.

3) **Modelo de identidad**
- Se emite token HMAC con `worldId`, `wallet`, `iat` y `exp` (30 min). Los tokens sin `worldId` son rechazados fuera de dev/test.
- Store persistente de `worldId ↔ wallets` mantiene últimos usos y torneos asociados.

4) **Anti-sybil**
- Nullifiers se registran por acción y bloquean replays. Un `worldId` no puede comprar múltiples entradas al mismo torneo: la participación queda registrada y se rechazan duplicados.

5) **Protección de rutas sensibles**
- `requireAuth` obliga a token válido en initiate-payment, confirm-payment y submit-answer; el backend usa siempre `req.user.worldId/wallet` como fuente de verdad.

6) **Replay protection**
- Reutilización de pruebas (`nullifier + action`) devuelve 409. Tokens expirados se invalidan en middleware.

7) **Privacidad / almacenamiento**
- Se persisten solo worldId, wallets, timestamps y acciones; no se guarda el payload completo de la prueba. En producción el mock queda bloqueado y se minimizan logs.

## Matriz de cumplimiento World ID
| Área | Estado | Comentario |
| --- | --- | --- |
| Verify frontend | OK | Solo se considera verificado si el backend confirma y entrega token válido. |
| Verify backend | OK | `verifyCloudProof` obligatorio con `APP_ID` y validación de action/signal; mock vetado en prod. |
| Modelo de identidad | OK | Token HMAC con worldId+wallet y expiración; store persistente de vínculos. |
| Anti-sybil | OK | Nullifiers deduplicados por acción y una única entrada por torneo por worldId. |
| Protección rutas sensibles | OK | Token requerido en pagos/respuestas; se usa identidad del token, no del body. |
| Replay protection | OK | Rechazo de reuse de pruebas y tokens expirados. |
| Privacidad / almacenamiento | OK | Solo identificadores mínimos persistidos; sin payloads completos ni mock en prod. |

## Conclusión
La implementación actual usa World ID como control de identidad y anti-sybil efectivo: verifica pruebas en backend, liga worldId y wallet a un token expirable, evita replays y duplicados por torneo, y limita el almacenamiento a identificadores esenciales. El único paso pendiente fuera del código es configurar las credenciales reales (`APP_ID`, `WORLD_ID_ACTION`, `WORLD_ID_SIGNAL`) en el entorno de despliegue.
