# ShopFreak

A small e-commerce platform built for the "Authentication & Product CRUD APIs" assignment: JWT access + refresh token auth with buyer/seller roles, product CRUD with per-size stock, and a per-user cart — plus a React frontend to use it.

| | |
| --- | --- |
| **Backend** | [`ecom-api-with-auth/`](./ecom-api-with-auth) — Node.js, Express 5, MongoDB (Mongoose), express-validator |
| **Frontend** | [`ecom-frontend/`](./ecom-frontend) — React 19, Redux Toolkit, React Router, Tailwind CSS v4, Vite |

This file covers both projects end to end — setup, architecture, API reference, and production notes for each.

## Features

### Authentication

- Register / login / logout / silent session restore on page reload
- Short-lived access token (returned in the response body) + long-lived refresh token (httpOnly cookie), rotated on every refresh, with reuse detection
- Two account types set at sign-up — **buyer** and **seller** — picked via a clear visual toggle on the register page, with a name + role badge shown in the navbar once logged in

### Shopping

- Browse products with search, category filter, and pagination
- Per-size stock: sizes with no stock are shown as disabled/"Unavailable" rather than hidden
- Cart with quantity controls that can never exceed real stock (enforced both client- and server-side)
- Light/dark theme toggle, fully responsive (mobile hamburger nav, breakpoint-tuned layouts)

### Selling

- Seller dashboard listing all of a seller's own products (including unlisted ones)
- Create / edit / unlist / relist / delete products, with a per-size stock editor
- A seller can only modify their own products; a buyer hitting a seller-only route gets `403`, a guest gets `401`

### Out of scope

Checkout, payment, order tracking, returns, and customer support are intentionally not implemented — outside this assignment's brief.

## Project structure

```text
ecom/
├── ecom-api-with-auth/   # Express + MongoDB API
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/         # DB connection
│       ├── models/         # User, Product, Cart (Mongoose schemas)
│       ├── controllers/    # route handlers
│       ├── routes/         # route tables
│       ├── middlewares/    # auth, role checks, validation, rate limiting, sanitizing, errors
│       ├── validators/     # express-validator chains
│       └── utils/          # token helpers, asyncHandler, env validation
└── ecom-frontend/        # React + Redux Toolkit SPA
    └── src/
        ├── config/          # axios instance (auth header + silent refresh)
        ├── store/           # Redux store
        ├── features/        # auth / products / cart slices
        ├── components/      # shared UI (Navbar, ProtectedRoute, SizeSelector, ...)
        ├── pages/           # route-level screens (lazy-loaded)
        ├── layout/, routes/ # page shell + route table
        └── utils/           # formatPrice, error-message helper
```

## Quick start (run both locally)

You'll need Node.js 18+ and a MongoDB instance (local or [Atlas](https://www.mongodb.com/cloud/atlas)).

```bash
# 1. Backend
cd ecom-api-with-auth
npm install
cp .env.example .env      # fill in MONGO_URI, JWT secrets, etc. - see table below
npm run dev                # http://localhost:5000

# 2. Frontend (in a new terminal)
cd ecom-frontend
npm install
cp .env.example .env      # VITE_API_URL should point at the backend above
npm run dev                # http://localhost:5173
```

The backend's `CLIENT_URL` must match the frontend's actual dev URL (and vice versa for `VITE_API_URL`) — the refresh-token cookie is cross-origin and needs matching CORS + credentials configuration on both sides.

### Environment variables

#### Backend (`ecom-api-with-auth/.env`)

| Variable | Description |
| --- | --- |
| `PORT` | Port the server listens on |
| `MONGO_URI` | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | Secret used to sign access tokens |
| `REFRESH_TOKEN_SECRET` | Secret used to sign refresh tokens |
| `ACCESS_TOKEN_EXPIRY` | e.g. `15m` |
| `REFRESH_TOKEN_EXPIRY` | e.g. `7d` |
| `CLIENT_URL` | Frontend origin, used for CORS (must send credentials) |
| `NODE_ENV` | `development` / `production` (controls the refresh cookie's `secure` flag) |

#### Frontend (`ecom-frontend/.env`)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the backend's API, e.g. `http://localhost:5000/api` |

---

## Backend (`ecom-api-with-auth`)

### Notes on implementation choices

- Passwords are hashed with **bcryptjs** (a pure-JS, drop-in-compatible implementation of `bcrypt` — same `hash`/`compare` API, chosen to avoid native build tooling on Windows). Refresh tokens are hashed with **SHA-256** instead of bcrypt: bcrypt truncates its input at 72 bytes, and these JWTs share a long identical prefix (header + user id) before the part that actually differs, so bcrypt would treat different-but-truncated-equal tokens as a match. SHA-256 has no such truncation and is the right tool for hashing an already-high-entropy random token (bcrypt's slow cost function exists to resist brute-forcing low-entropy secrets like passwords, which isn't the threat model here). Either way, a database leak alone can't be replayed as a valid session.
- The access token is returned in the JSON response body; the refresh token is set as an `httpOnly` cookie and is rotated (a new one is issued and the old one invalidated) every time `/refresh-token` is called. Presenting an old, already-rotated refresh token is treated as reuse and returns `403`.
- `401` means "you're not logged in / your token is invalid" (from the `authenticate` middleware). `403` means "you're logged in, but not allowed to do this" — either wrong role (`authorize` middleware, e.g. a buyer hitting a seller-only route) or not the owner of the resource (e.g. a seller editing another seller's product).
- A cart line item's quantity can never exceed that size's current stock — enforced server-side on both add and update (`src/controllers/cart.controller.js`), not just at add-time.

### Production hardening

- **Security headers** via `helmet`; **gzip** via `compression`; **request logging** via `morgan` (`dev` format locally, `combined` in production).
- **Rate limiting**: `/api/auth/*` is capped at 20 requests per 15 minutes per IP (`src/middlewares/rateLimit.middleware.js`), to slow down credential-stuffing/brute-force attempts.
- **NoSQL injection protection**: `src/middlewares/sanitize.middleware.js` strips any `$`-prefixed or dotted key from `req.body`/`req.params`/`req.query` before it reaches a query (e.g. blocks `?category[$ne]=null`). Mutates in place rather than reassigning, since Express 5 makes `req.query` read-only.
- **Centralized error handling**: controllers no longer each have their own try/catch; `src/utils/asyncHandler.js` forwards rejected promises to `src/middlewares/errorHandler.middleware.js`, which maps common Mongoose errors (`CastError`, duplicate key, `ValidationError`) to sensible status codes and hides internal error details in production.
- **Fail-fast startup**: `src/utils/validateEnv.js` checks `MONGO_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, and `CLIENT_URL` are set before the server starts, with a clear error instead of a confusing runtime failure later.
- **Graceful shutdown**: `server.js` handles `SIGTERM`/`SIGINT` by finishing in-flight requests and closing the MongoDB connection before exiting, so platform restarts/deploys don't drop connections mid-request.
- `app.set("trust proxy", 1)` so secure cookies and client IPs (used by the rate limiter) work correctly behind a reverse proxy (Render, Railway, Heroku, etc.).
- `express.json({ limit: "10kb" })` caps request body size.
- **`GET /health`**: unauthenticated, not rate-limited. Returns `200` with `{status: "ok", db: "connected", uptime, timestamp}`, or `503` with `db: "disconnected"` if MongoDB is down - point your platform's health check / uptime monitor at this, not `/`.

### Deployment

1. Provision a MongoDB instance (Atlas free tier works) and set `MONGO_URI` to it.
2. Deploy `ecom-api-with-auth` to any Node host (Render, Railway, Fly.io, ...): build command `npm install`, start command `npm start`.
3. Set all variables from `.env.example` in the host's environment settings — in particular set `NODE_ENV=production` (enables secure cookies) and `CLIENT_URL` to the deployed frontend's real URL (CORS will reject anything else).
4. Deploy `ecom-frontend` (static build via `npm run build`) to any static host (Vercel, Netlify, Render static site, ...) with `VITE_API_URL` pointing at this backend's deployed URL.

### API Endpoints

#### Auth (`/api/auth`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/register` | Public | Create an account. Body: `name, email, password, confirmPassword, role?(buyer\|seller, default buyer)` |
| POST | `/login` | Public | Body: `email, password`. Returns `accessToken` + user, sets refresh cookie |
| POST | `/refresh-token` | Public (valid refresh cookie required) | Issues a new access token and rotates the refresh token |
| POST | `/logout` | Authenticated | Invalidates the stored refresh token and clears the cookie |
| GET | `/me` | Authenticated | Returns the logged-in user's profile |

#### Products (`/api/products`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/` | Seller only | Create a product (`name, description, price, category, images?, sizes?[{size, stock}]`) |
| GET | `/` | Public | List listed products. Query: `page, limit, category, search` (search matches product name, case-insensitive) |
| GET | `/:id` | Public | Get a single product |
| PUT | `/:id` | Seller (owner only) | Update a product, incl. `isListed` (unlist/relist) |
| DELETE | `/:id` | Seller (owner only) | Delete a product |
| GET | `/seller/mine` | Seller only | List the caller's own products, including unlisted ones |

#### Cart (`/api/cart`) — all authenticated, any role

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Get (or create) the caller's cart |
| POST | `/items` | Add `{productId, size, quantity?}`; increments quantity if that product+size is already in the cart |
| PUT | `/items/:productId` | Update `{size, quantity}` for a line item |
| DELETE | `/items/:productId` | Remove a line item, body `{size}` |
| DELETE | `/` | Clear the cart |

`401` = not logged in / invalid token. `403` = logged in but not allowed (wrong role, or not the resource owner).

---

## Frontend (`ecom-frontend`)

### Structure

- `src/config/axiosInstance.js` — shared axios instance. Attaches the access token to every request and, on a 401, silently retries once via `/auth/refresh-token` before giving up.
- `src/store/` — Redux Toolkit store; `src/features/{auth,products,cart}/*Slice.js` — one slice per domain, each with its own `createAsyncThunk`s.
- `src/pages/` — route-level screens (lazy-loaded, see below); `src/components/` — shared UI pieces (`ProtectedRoute` gates by login/role, `SizeSelector` renders out-of-stock sizes as disabled rather than hiding them, `ProductImage` falls back to a placeholder icon when a product has no image, `PasswordInput` adds a show/hide toggle, `ThemeToggle` switches light/dark).
- `src/layout/MainLayout.jsx` + `src/routes/AppRoutes.jsx` — page shell and route table.

### How auth state works

The access token lives in memory only (a module variable in `axiosInstance.js`, mirrored into Redux for the UI to read) — never in `localStorage`. The refresh token is an httpOnly cookie set by the backend, so the frontend never touches it directly. On app load, `App.jsx` dispatches `bootstrapAuth`, which silently calls `/auth/refresh-token` then `/auth/me` to restore a session; a guest visitor simply gets a 401 on that first call and is treated as logged out (no error shown).

### Theming

Dark/light mode is a class (`.dark` on `<html>`) toggled by `ThemeToggle.jsx`, not the OS-only `prefers-color-scheme` media query — so a visitor's explicit choice sticks. A small inline script in `index.html` applies the saved (or system-default) theme before React mounts, avoiding a flash of the wrong theme on load.

### Production-readiness notes

- **Error boundary** (`src/components/ErrorBoundary.jsx`) wraps the app so a render bug shows a recoverable "Something went wrong" screen instead of a blank page.
- **Route-level code splitting**: every page in `src/routes/AppRoutes.jsx` is `React.lazy`-loaded, so the initial bundle only ships the shell; each page fetches on first visit.
- **404 page** (`src/pages/NotFound.jsx`) for unmatched routes, instead of silently falling back to the shop.
- **Search, category filter, and pagination** on the shop page, backed by the API's `search`/`category`/`page`/`limit` query params (debounced 400ms so filtering doesn't fire a request per keystroke).
- **Stock-aware cart**: quantity can't be pushed past the size's actual stock — the `+` button disables itself and a toast explains why, mirroring the same cap the backend enforces.
- Network failures (backend unreachable, timeout) show a clear message instead of a blank/`undefined` toast (`src/utils/getErrorMessage.js`).

---

## Notes

- The assignment asks for backend + frontend in a single repository. `ecom-api-with-auth` already has its own git remote; `ecom-frontend` is a sibling folder without git initialized yet. Combine them into one repo (e.g. move `ecom-frontend` into this repo as a subfolder, or create a fresh parent repo containing both) before final submission.
- Product images are added as plain URLs on the create/edit form (no file upload), since the assignment doesn't require image upload.
- Checkout/payment/order-tracking are intentionally not implemented — out of scope per the assignment brief.
