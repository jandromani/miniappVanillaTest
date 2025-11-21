# Informe WLD / MiniKit / World Chain (estado final)

## Resumen ejecutivo
- Identidad con World ID via `MiniKit.verify` y token de sesión HMAC (wallet + worldId) exigido en pagos y respuestas.
- Pagos de entrada solo vía `MiniKit.pay`; el backend genera referencia, amount/token/to server-side, firma HMAC y guarda wallet/worldId.
- Confirmación consulta Worldcoin API (o mock solo en no-prod) validando reference, token, amount y destinatario antes de marcar `confirmed` y sumar al bote.
- Prize pool se calcula solo con pagos confirmados; rake aplicado en backend y snapshots `syncPrizePoolWithOnChain` persistidos.
- Rankings y payouts se derivan de respuestas persistidas; se construye Merkle root y se publica txHash real/mock vía cliente World Chain listo para RPC.
- Auditoría financiera expone endpoint de consistencia y log de transacciones Worldcoin; frontend muestra enlaces a explorer configurables.

## 1) Identidad, World ID y wallets
- **Lo que hace ahora**: `/verify` emite token de sesión HMAC con wallet/worldId; middleware `requireAuth` lo exige en initiate/confirm-payment y respuestas. Wallet proviene de input y se asocia a pagos/entradas.
- **Riesgos/Gaps**: Ninguno en repo; requiere APP_ID válido para verificación real.
- **Estado**: Listo.

## 2) Flujo de pago MiniKit (WLD/USDC)
- **Lo que hace ahora**: `initiate-payment` ignora amount cliente y usa entryFee/token/to definidos en backend, firma payload HMAC y persiste referencia. `confirm-payment` valida firma, wallet, y llama a `verifyWorldcoinTransaction` con match de reference/status/amount/symbol/to; mock bloqueado en prod si faltan credenciales.
- **Riesgos/Gaps**: Ninguno; solo falta configurar credenciales reales para salir de mock.
- **Estado**: Listo.

## 3) Construcción del pot
- **Lo que hace ahora**: Prize pool se deriva exclusivamente de pagos `confirmed`; cada entrada es 1:1 con transacción verificada. HMAC evita replay/manipulación de amount/token.
- **Riesgos/Gaps**: Ninguno.
- **Estado**: Listo.

## 4) Reparto del pot (payouts)
- **Lo que hace ahora**: Ranking basado en respuestas persistidas; splits determinísticos generan payloads y Merkle root. Cliente World Chain devuelve txHash real/mock y se guarda junto a payouts y explorer URL.
- **Riesgos/Gaps**: Ninguno; envío real depende de configurar RPC/contrato.
- **Estado**: Listo.

## 5) Control de protocolo (World App / Worldchain)
- **Lo que hace ahora**: No hay firmas custodiales; entradas solo via MiniKit; mock deshabilitado en prod sin credenciales. HMAC en initiate/confirm y token de sesión evitan replay entre clientes.
- **Riesgos/Gaps**: Ninguno.
- **Estado**: Listo.

## 6) Worldchain / on-chain
- **Lo que hace ahora**: Genera Merkle root, payloads y txHash (real si RPC/contract configurados, mock si no). Snapshots y enlaces de explorer expuestos al frontend mediante `EXPLORER_BASE_URL`.
- **Riesgos/Gaps**: Ninguno en código; requiere variables de entorno para red real.
- **Estado**: Listo.

## Matriz de cumplimiento WLD
| Área | Estado | Comentario |
| --- | --- | --- |
| Registro/identidad | OK | Token HMAC tras verify, requerido en pagos/respuestas. |
| Pagos MiniKit | OK | Amount/token/to fijados en backend, verificación Worldcoin con match estricto. |
| Construcción del pot | OK | Solo pagos confirmados incrementan entradas/prize pool. |
| Reparto del pot | OK | Payouts determinísticos con Merkle y txHash World Chain cliente. |
| Custodia/control de fondos | OK | Sin llaves de usuario; mock vetado en prod; HMAC anti-replay. |
| Preparación on-chain | OK | Cliente listo para RPC real, explorer configurable, snapshots persistidos. |

## Plan de remediación
Sin acciones pendientes: el código queda listo para demo/pre-prod; solo falta configurar credenciales (APP_ID, DEV_PORTAL_API_KEY, TREASURY_ADDRESS, WORLDCHAIN_RPC_URL, WORLDCHAIN_CONTRACT_ADDRESS, EXPLORER_BASE_URL) en despliegue real.
