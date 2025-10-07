# Dyad (Web)

This repository has been migrated from an Electron desktop app to a **pure web app** built with **React 19 + Vite 5 + Tailwind 4**. The UI, routing, and state management remain the same; Electron-specific layers have been removed or adapted.

## Run locally

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Architecture changes

- Electron `main`/`preload` and IPC were removed. A browser adapter now exposes the same surface via HTTP/WebSocket endpoints. See `src/ipc/ipc_client.ts`.
- Database switched from `better-sqlite3` to **Drizzle ORM + sql.js** (SQLite WASM) with LocalStorage persistence. See `src/db/index.ts`.
- Environment variables are read via `import.meta.env` (e.g. `VITE_API_BASE_URL`, `VITE_DYAD_ENGINE_URL`, `VITE_DYAD_GATEWAY_URL`).

## Environment

Create a `.env` file for local development:

```
VITE_API_BASE_URL=http://localhost:8787
VITE_DYAD_ENGINE_URL=
VITE_DYAD_GATEWAY_URL=
```

## Testing

- Unit: `npm run test`
- E2E: `npm run e2e`

## Deploy

The app builds to static assets in `dist/` and can be deployed on Vercel, Netlify, or Supabase.
