# AGENTS.md

## Read this first
- Current working tree is **mid-restructure**: `server.js` + `modelos/` are the live backend. The React app (`frontend/`) and legacy static site (`public/`) still exist in git `HEAD` but are deleted in the working tree.
- `public_respaldo/` is a gitignored copy of the old static site; do not commit it or edit it expecting changes to ship.
- Restore the React frontend with `git restore frontend/` if you need it. `README.md` still claims React but describes neither the current tree nor setup.
- `estructura.txt` is a stale Windows `tree` dump (UTF-16), not documentation.

## Commands
- Backend: `node server.js` (port 3000). There is **no root `npm start`/test/lint script**, no build step, and no test suite.
- Seed products: `node cargar-productos.js` — upserts 5 products by name; it does not delete extra products.
- Required `.env` keys: `MONGO_URI`, `JWT_SECRET` (`.env` is gitignored; never commit it). Mongo connection failure only logs an error; the server still starts.
- If `frontend/` is restored: `cd frontend`, `npm install`, `npm run dev` (Vite proxies `/api` to `http://localhost:3000`), `npm run lint`, `npm run build`.

## Backend facts
- All routes live in `server.js`: `/api/productos`, `/api/contactos`, `/api/auth/*`, `/api/perfil`, `/api/pedidos`.
- Mongo collection names are explicitly capitalized: `Usuarios`, `Pedidos`, `Productos`, `Contactos` (third arg of `mongoose.model`).
- Registration always creates `rol: 'cliente'`. There is no admin-creation endpoint; promote manually in Mongo: `db.Usuarios.updateOne({ email: "..." }, { $set: { rol: "admin" } })`.
- Auth is Bearer JWT (7 days) signed with `JWT_SECRET`; `soloAdmin` re-reads the user's role from the DB on every request. Login/registro are rate-limited to 10 requests per 15 minutes.
- Keep user-facing responses and validation messages in Spanish, matching existing code.

## Frontend facts (when `frontend/` is present)
- Auth state is `localStorage.token` / `localStorage.usuario`; `Navbar` listens for the custom `sesion-cambio` event, so dispatch it after login/logout changes.
- `src/pages/Productos.jsx` hardcodes the catalog (names, prices, `/assets/img/...`), it does not fetch `/api/productos`.
- The order flow posts to `/api/pedidos` then opens WhatsApp; ordering requires a logged-in token.
- Current `server.js` no longer calls `express.static('public')`. Add it back only if intentionally serving the legacy static site.

## Reglas del estudiante (Jóvenes creaTIvos 2026)

- Soy estudiante: explicame en español y con palabras sencillas .
- Frontend: React 19 + Vite con JavaScript (sin TypeScript).
- Backend: Node.js + Express 5 + MongoDB local.
- No instales paquetes sin preguntarme primero. 
- Nunca abras ni muestres mis archivos .env.
- No hagas commit ni push: los hago yo.
- Antes de un cambio grande, muestrame un plan y espera mi "o".
- Al terminas, dime qué archivos cambiaste y cómo probarlo.
    