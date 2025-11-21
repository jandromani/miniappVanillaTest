# Vanilla JS example of minikit

Apart from a frontend, you'll need a backend, this template contains an example of that as well

## To run, install:

- deps, `cd frontend;pnpm i;cd -;cd backend;pnpm i`
- ngrok - Create a free ngrok account, follow the official [docs](https://ngrok.com/docs/getting-started/)
- nginx - use you favorite package manager :)

### nginx setup

To serve multiple localhost applications through a single ngrok tunnel (only one available for free-tier users), you can use nginx as a reverse proxy. Follow the steps below to set it up:

### Run nginx

Use the config provided in the root of this repo
`sudo nginx -c full/path/to/this/repo/nginx.conf`
or, if you run the command from the root dir
`sudo nginx -c $(pwd)/nginx.conf`

To stop nginx run `sudo nginx -s stop`

### Tunnel through Ngrok

`ngrok http 8080`
The port doesn't matter, make sure it's the `listen` one from nginx config

## Desarrollo local

1) Backend

- Instala dependencias: `cd backend && pnpm install`
- Lanza en modo desarrollo: `pnpm dev` (escucha en `http://localhost:8080`)
- Para producción local: `pnpm build && pnpm start`

2) Ngrok (opcional para mini app real)

- Expone el backend: `ngrok http 8080`
- Usa el subdominio generado, por ejemplo `https://<subdominio>.ngrok-free.dev`

3) Frontend

- Instala dependencias: `cd frontend && pnpm install`
- Configura la API: crea `.env` en `frontend/` con `VITE_API_BASE_URL=http://localhost:8080` (o tu URL de ngrok)
- Lanza el frontend: `pnpm dev` (abre `http://localhost:5173`)

4) Variables clave para MiniKit

- Define `VITE_MINIKIT_APP_ID`, `window.MINIKIT_APP_ID` y `window.API_BASE` (en `index.html` o `.env`) según tu app de Worldcoin.
- En modo ngrok, `VITE_API_BASE_URL` debe apuntar al dominio `https://<subdominio>.ngrok-free.dev`.

Con esta configuración, el frontend hará las llamadas a:

- `GET {API_BASE}/api/tournaments` → devuelve `{ tournaments: Tournament[] }` con `id`, `name`, `status`, `entryFee`, `basePrizePool`, `rakePercent`, `endsAt`, `players`, `prizePool`, `rakeAmount` y `explorerBaseUrl`.
- `GET {API_BASE}/api/tournaments/{id}/leaderboard` → devuelve `{ ok: true, leaderboard: LeaderboardEntry[] }` con `position`, `wallet`, `userId`, `correct`, `timeMs` y `reward`.
- `GET {API_BASE}/api/game/demo/question` → endpoint SSE (`text/event-stream`) que envía `data: { ...session, signature }` y eventos `tick` con la misma firma de tiempo.

sin errores CORS ni 404 siempre que el backend esté corriendo en el puerto indicado.
