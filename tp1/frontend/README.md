# Index Studio — frontend

React + Vite + TypeScript + Tailwind + Framer Motion. Three screens: **log in / forgot password**, the **admin console** (`/admin`) and the **user page** (`/app`).

## Run it

Start the backend first (see `CLAUDE.md`), then:

```bash
npm install
npm run dev
```

Open http://localhost:5173 and log in with an account from `backend/.env`. Vite forwards `/api` to the backend on port 8000.
Check the production build with `npm run build`.

Fake data without a backend: set `VITE_USE_MOCKS=true` in `.env` (any password works; an email starting with "admin" opens the admin console).
Demo switches (fake data only): `?mock=error` makes indexing fail, `?mock=save-error` makes the download fail.

## Who sees what

- **Admin**: Dataset (CSV or XML) → Documents → Pipeline (tick + drag; CSV locks Tag cleaning; Stemming and Lemmatization exclude each other) → Indexing → Metrics → Save (download .zip, or save on the server disk when local) → Publish (what users get).
- **User**: picks a number of documents, runs, sees the metrics and downloads the .zip. The dataset and pipeline come from the admin's last Publish.
- Online, the document sliders stop at `MAX_DOCUMENTS_ONLINE` and show a red message.

## Folders (`src/`)

| Folder | What is inside |
|---|---|
| `pages/` | `LoginPage`, `ForgotPasswordPage`, `AdminPage` (owns the admin state), `UserPage` |
| `App.tsx` | Picks the page from the URL and redirects by role (`lib/router.ts` is a tiny router) |
| `auth/` | `AuthContext` (who is logged in) and `session.ts` (the token in the browser) |
| `components/` | One folder per section (dataset, documents, pipeline, indexing, metrics, storage, publish, auth), plus `layout/` and `ui/` |
| `hooks/` | Logic: `usePipeline` (rules), `useIndexing` (reads the stream), `useCappedCount` (online cap), `useAction`, … |
| `api/` | `index.ts` has one function per endpoint and the `USE_MOCKS` switch. Contract: `api/README.md` |
| `mocks/` | Fake backend that answers like the real one |
| `types/` | Request and response types (the API contract) |
| `i18n/` | All UI text in `en.ts` (add `fr.ts` later) |
| `styles/` | `index.css` holds every color as a CSS variable |
| `lib/` | Small helpers (formatting, chart scale, pipeline warnings, router) |

## Change the colors

Edit the variables at the top of `src/styles/index.css`. Tailwind reads them from `tailwind.config.js`.
Blue is the main color. Orange is the highlight (Generate and Run buttons, progress, warnings). Red (`bad`) is only for hard limits.
