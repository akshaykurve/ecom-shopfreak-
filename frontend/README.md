# ShopFreak (ecom-frontend)

React + Redux Toolkit frontend for **ShopFreak**, consuming [ecom-api-with-auth](../ecom-api-with-auth). Buyer/seller auth, product browsing with per-size stock, and a cart.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your running backend
npm run dev
```

Requires the backend (`ecom-api-with-auth`) to be running and its `CLIENT_URL` env var to match this app's dev URL (default `http://localhost:5173`), since the refresh-token cookie is cross-origin and needs matching CORS + credentials config.

## Structure

- `src/config/axiosInstance.js` — shared axios instance. Attaches the access token to every request and, on a 401, silently retries once via `/auth/refresh-token` before giving up.
- `src/store/` — Redux Toolkit store; `src/features/{auth,products,cart}/*Slice.js` — one slice per domain, each with its own `createAsyncThunk`s.
- `src/pages/` — route-level screens (lazy-loaded, see below); `src/components/` — shared UI pieces (`ProtectedRoute` gates by login/role, `SizeSelector` renders out-of-stock sizes as disabled rather than hiding them, `ProductImage` falls back to a placeholder icon when a product has no image, `PasswordInput` adds a show/hide toggle, `ThemeToggle` switches light/dark).
- `src/layout/MainLayout.jsx` + `src/routes/AppRoutes.jsx` — page shell and route table.

## How auth state works

The access token lives in memory only (a module variable in `axiosInstance.js`, mirrored into Redux for the UI to read) — never in `localStorage`. The refresh token is an httpOnly cookie set by the backend, so the frontend never touches it directly. On app load, `App.jsx` dispatches `bootstrapAuth`, which silently calls `/auth/refresh-token` then `/auth/me` to restore a session; a guest visitor simply gets a 401 on that first call and is treated as logged out (no error shown).

## Theming

Dark/light mode is a class (`.dark` on `<html>`) toggled by `ThemeToggle.jsx`, not the OS-only `prefers-color-scheme` media query — so a visitor's explicit choice sticks. A small inline script in `index.html` applies the saved (or system-default) theme before React mounts, avoiding a flash of the wrong theme on load.

## Production-readiness notes

- **Error boundary** (`src/components/ErrorBoundary.jsx`) wraps the app so a render bug shows a recoverable "Something went wrong" screen instead of a blank page.
- **Route-level code splitting**: every page in `src/routes/AppRoutes.jsx` is `React.lazy`-loaded, so the initial bundle only ships the shell; each page fetches on first visit.
- **404 page** (`src/pages/NotFound.jsx`) for unmatched routes, instead of silently falling back to the shop.
- **Search, category filter, and pagination** on the shop page, backed by the API's `search`/`category`/`page`/`limit` query params (debounced 400ms so filtering doesn't fire a request per keystroke).
- **Stock-aware cart**: quantity can't be pushed past the size's actual stock — the `+` button disables itself and a toast explains why, mirroring the same cap the backend enforces.
- Network failures (backend unreachable, timeout) show a clear message instead of a blank/`undefined` toast (`src/utils/getErrorMessage.js`).

## Notes

- The assignment asks for backend + frontend in a single repository; see the note in `ecom-api-with-auth/README.md` about combining them before submission.
- Product images are added as plain URLs on the create/edit form (no file upload), since the assignment doesn't require image upload.
- Checkout/payment/order-tracking are intentionally not implemented — out of scope per the assignment brief.
