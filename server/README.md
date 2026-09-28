# ShopFreak API (ecom-api-with-auth)

Backend for **ShopFreak**, a small e-commerce platform: JWT access + refresh token authentication (buyer/seller roles), product CRUD with per-size stock, and a per-user shopping cart. Built with Express + MongoDB (Mongoose) + express-validator.

## Setup

```bash
npm install
cp .env.example .env   # then fill in real values (Mongo URI, JWT secrets, etc.)
npm run dev            # starts the server with nodemon on PORT (default 5000)
```

### Environment variables

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

## Notes on implementation choices

- Passwords are hashed with **bcryptjs** (a pure-JS, drop-in-compatible implementation of `bcrypt` — same `hash`/`compare` API, chosen to avoid native build tooling on Windows). Refresh tokens are hashed with **SHA-256** instead of bcrypt: bcrypt truncates its input at 72 bytes, and these JWTs share a long identical prefix (header + user id) before the part that actually differs, so bcrypt would treat different-but-truncated-equal tokens as a match. SHA-256 has no such truncation and is the right tool for hashing an already-high-entropy random token (bcrypt's slow cost function exists to resist brute-forcing low-entropy secrets like passwords, which isn't the threat model here). Either way, a database leak alone can't be replayed as a valid session.
- The access token is returned in the JSON response body; the refresh token is set as an `httpOnly` cookie and is rotated (a new one is issued and the old one invalidated) every time `/refresh-token` is called. Presenting an old, already-rotated refresh token is treated as reuse and returns `403`.
- `401` means "you're not logged in / your token is invalid" (from the `authenticate` middleware). `403` means "you're logged in, but not allowed to do this" — either wrong role (`authorize` middleware, e.g. a buyer hitting a seller-only route) or not the owner of the resource (e.g. a seller editing another seller's product).
- A cart line item's quantity can never exceed that size's current stock — enforced server-side on both add and update (`src/controllers/cart.controller.js`), not just at add-time.

## Production hardening

- **Security headers** via `helmet`; **gzip** via `compression`; **request logging** via `morgan` (`dev` format locally, `combined` in production).
- **Rate limiting**: `/api/auth/*` is capped at 20 requests per 15 minutes per IP (`src/middlewares/rateLimit.middleware.js`), to slow down credential-stuffing/brute-force attempts.
- **NoSQL injection protection**: `src/middlewares/sanitize.middleware.js` strips any `$`-prefixed or dotted key from `req.body`/`req.params`/`req.query` before it reaches a query (e.g. blocks `?category[$ne]=null`). Mutates in place rather than reassigning, since Express 5 makes `req.query` read-only.
- **Centralized error handling**: controllers no longer each have their own try/catch; `src/utils/asyncHandler.js` forwards rejected promises to `src/middlewares/errorHandler.middleware.js`, which maps common Mongoose errors (`CastError`, duplicate key, `ValidationError`) to sensible status codes and hides internal error details in production.
- **Fail-fast startup**: `src/utils/validateEnv.js` checks `MONGO_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, and `CLIENT_URL` are set before the server starts, with a clear error instead of a confusing runtime failure later.
- **Graceful shutdown**: `server.js` handles `SIGTERM`/`SIGINT` by finishing in-flight requests and closing the MongoDB connection before exiting, so platform restarts/deploys don't drop connections mid-request.
- `app.set("trust proxy", 1)` so secure cookies and client IPs (used by the rate limiter) work correctly behind a reverse proxy (Render, Railway, Heroku, etc.).
- `express.json({ limit: "10kb" })` caps request body size.
- **`GET /health`**: unauthenticated, not rate-limited. Returns `200` with `{status: "ok", db: "connected", uptime, timestamp}`, or `503` with `db: "disconnected"` if MongoDB is down - point your platform's health check / uptime monitor at this, not `/`.

## Deployment

1. Provision a MongoDB instance (Atlas free tier works) and set `MONGO_URI` to it.
2. Deploy this folder to any Node host (Render, Railway, Fly.io, ...): build command `npm install`, start command `npm start`.
3. Set all variables from `.env.example` in the host's environment settings — in particular set `NODE_ENV=production` (enables secure cookies) and `CLIENT_URL` to the deployed frontend's real URL (CORS will reject anything else).
4. Point the frontend's `VITE_API_URL` at this backend's deployed URL and redeploy the frontend.

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/register` | Public | Create an account. Body: `name, email, password, confirmPassword, role?(buyer\|seller, default buyer)` |
| POST | `/login` | Public | Body: `email, password`. Returns `accessToken` + user, sets refresh cookie |
| POST | `/refresh-token` | Public (valid refresh cookie required) | Issues a new access token and rotates the refresh token |
| POST | `/logout` | Authenticated | Invalidates the stored refresh token and clears the cookie |
| GET | `/me` | Authenticated | Returns the logged-in user's profile |

### Products (`/api/products`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/` | Seller only | Create a product (`name, description, price, category, images?, sizes?[{size, stock}]`) |
| GET | `/` | Public | List listed products. Query: `page, limit, category, search` (search matches product name, case-insensitive) |
| GET | `/:id` | Public | Get a single product |
| PUT | `/:id` | Seller (owner only) | Update a product, incl. `isListed` (unlist/relist) |
| DELETE | `/:id` | Seller (owner only) | Delete a product |
| GET | `/seller/mine` | Seller only | List the caller's own products, including unlisted ones |

### Cart (`/api/cart`) — all authenticated, any role

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Get (or create) the caller's cart |
| POST | `/items` | Add `{productId, size, quantity?}`; increments quantity if that product+size is already in the cart |
| PUT | `/items/:productId` | Update `{size, quantity}` for a line item |
| DELETE | `/items/:productId` | Remove a line item, body `{size}` |
| DELETE | `/` | Clear the cart |

## Repository note

The assignment asks for backend + frontend in a single repository. This backend (`ecom-api-with-auth`) already has its own git remote; the frontend (`ecom-frontend`) is a sibling folder without git initialized yet. Combine them into one repo (e.g. move `ecom-frontend` into this repo as a subfolder, or create a fresh parent repo containing both) before final submission.
 