# plan.md — RI Project, Part 1: Admin Indexing App

> Say **"next step"** in any chat → Claude reads this file, explains the next unchecked step, and waits for your green light (🤖) or gives you a guide (✋).

**Legend:** 🤖 = Claude builds it (frontend/interface, you just prompt) · ✋ = you write it by hand, Claude guides · ⬜ not started · 🟦 in progress · ✅ done

**Decisions so far**
- Core logic: **Python**, written from scratch (no NLTK / spaCy / `re` for the core NLP).
- App type: **Web app** → `frontend/` (React) talks to a small **FastAPI** backend.
- Backend folders organized **by layers**. Phase 2 (search) will be added later.

---

## Project structure (proposed — to confirm)

```
tp1/
├── CLAUDE.md                  # rules for Claude
├── plan.md                    # this file
├── corpus/                    # Reuters data (already here, never edit)
├── saved_indexes/             # output of "Save indexes" (created by the app)
│
├── backend/                   # ✋ all your logic lives here
│   ├── requirements.txt
│   ├── main.py                # starts the FastAPI app
│   ├── api/                   # thin routes: receive request → call a layer → return JSON
│   │   ├── routes_documents.py
│   │   ├── routes_indexing.py
│   │   └── schemas.py         # the shape of requests/responses (the "API contract")
│   ├── data/                  # reading the corpus
│   │   └── loader.py
│   ├── nlp/                   # one file per preprocessing step
│   │   ├── tag_cleaning.py
│   │   ├── normalization.py
│   │   ├── stopwords.py       # + stopwords list file
│   │   ├── stemmer.py         # Porter-style, by hand
│   │   ├── lemmatizer.py      # rules + small exceptions dictionary, by hand
│   │   └── pipeline.py        # runs the chosen steps in the chosen order
│   ├── indexing/              # building the indexes
│   │   ├── vocabulary.py
│   │   ├── weighting.py       # BoW, F, TF, TF-IDF formulas
│   │   ├── matrices.py        # term-document and document-term matrices
│   │   ├── inverted_index.py  # posting lists
│   │   └── builder.py         # builds every model in every format
│   ├── monitoring/
│   │   └── metrics.py         # vocab size, doc count, memory per index
│   ├── storage/
│   │   └── serializer.py      # save / load indexes (JSON or binary)
│   └── tests/                 # small tests for each function
│
└── frontend/                  # 🤖 Claude builds this
    ├── package.json
    └── src/
        ├── components/        # pipeline builder, metrics cards, etc.
        ├── pages/
        ├── api/               # functions that call the backend
        ├── mocks/             # fake data so the UI works before the backend exists
        └── styles/
```

> ✅ Structure confirmed. It is the **target** layout only — do not create it upfront. Folders and files appear one by one when the code needs them.

Why this layout: each NLP step and each index type is its own small file, so you can explain any function in the in-person review. `nlp/` is reused later for user queries in Phase 2.

---

## Phase 0 — Setup and agreement
- [x] ✋ 0.1 Confirm the project structure above (or change it)
- [x] ✋ 0.2 ~~Create all folders now~~ → **Rule: no empty skeleton.** We create each folder/file only at the moment we need it, while coding (file by file, like real manual coding)
- [x] ✋ 0.3 Python virtual environment + `requirements.txt` (only `fastapi`, `uvicorn`, `pytest`)
  - [x] 0.3.1 `backend/` folder and `backend/.venv` created (Python 3.11.9)
  - [x] 0.3.2 Activate the venv and install the 3 packages
  - [x] 0.3.3 `backend/requirements.txt` created with `pip freeze`
- [x] ✋ 0.4 Dataset format: **CSV now** (`corpus/reuters21578_news.csv`), SGML files later only if there is time. Tag cleaning is built generic (works on any text with `<...>` tags) and tested on text with stray tags.
- [x] ✋ 0.5 Subset size: **N is a setting** (the admin chooses it in the UI). Dev N = **500**. Final demo N = try big (2000, 5000, 10000…) and keep the largest that runs well; note the limit in the report (matrix vs list memory).

## Phase 1 — Data loading ✋
- [x] 1.1 Read the CSV with Python's `csv` module (multi-line text fields)
  - [x] 1.1.1 Keep only the fields you need (id, title, body)
  - [x] 1.1.2 Handle empty bodies
- [x] 1.2 Choose a subset: **decided = first N valid documents in file order** (N comes from the UI)
- [x] 1.3 Return documents as a simple list of `{id, text}`
- [x] 1.4 Test: load and print 3 documents

## Phase 2 — NLP pipeline ✋ (the "from scratch" bonus is here)
- [x] 2.1 Tag cleaning: walk the string character by character, drop anything between `<` and `>`
- [x] 2.2 Normalization
  - [x] 2.2.1 Lowercase
  - [x] 2.2.2 Remove punctuation and numbers (your own character check)
  - [x] 2.2.3 Tokenize (split on spaces)
- [x] 2.3 Stopword removal: your own list in a file, stored in a `set`
- [x] 2.4 Stemming: write a simplified Porter stemmer by hand
  - [x] 2.4.1 Plural endings (`-s`, `-es`, `-ies`)
  - [x] 2.4.2 `-ed`, `-ing`
  - [x] 2.4.3 A few suffixes (`-ation`, `-ness`, `-ful`…)
- [x] 2.5 Lemmatization: rules + a small exceptions dictionary (`went → go`, `better → good`)
- [x] 2.6 Pipeline runner: takes a list like `["normalize", "stopwords", "stem"]` and runs the steps **in that order**
- [x] 2.7 Test each step alone, then the full pipeline on 3 documents

## Phase 3 — Indexing core ✋
- [x] 3.1 Vocabulary: sorted list of unique terms + term → position dictionary
- [x] 3.2 Model F (raw counts per document)
- [x] 3.3 Model BoW (1 if the term is present, else 0)
- [x] 3.4 Model TF (`tf / max_tf` in the document)
- [x] 3.5 Model TF-IDF (`TF × IDF`, define IDF and handle the zero case)
- [x] 3.6 Matrices
  - [x] 3.6.1 Document-term matrix
  - [x] 3.6.2 Term-document matrix (the transpose)
- [x] 3.7 Inverted index (posting lists) for each of the 4 models
- [x] 3.8 `builder.py`: build all 4 models × (2 matrices + 1 inverted index) = 12 structures
- [x] 3.9 Test on a tiny hand-made corpus (3 docs) and check numbers by hand

## Phase 4 — Monitoring ✋
- [x] 4.1 Vocabulary size and number of documents
- [x] 4.2 Memory of each structure (decide how: `sys.getsizeof` recursively — write the recursive size function yourself)
- [x] 4.3 Compare matrix vs inverted list and note why they differ (good for the report)

## Phase 5 — Saving and loading ✋
- [x] 5.1 Pick a format (JSON is easiest to read; binary is smaller)
- [x] 5.2 Save every index + the vocabulary + the pipeline settings used
- [x] 5.3 Load them back and check they are identical (Phase 2 needs this)

## Phase 6 — API (the bridge) ✋ with Claude guiding
- [x] 6.1 Write the API contract in `schemas.py` (what the frontend sends and receives) — **do this before the frontend**
- [x] 6.2 Route: choose the dataset / list documents
- [x] 6.3 Route: start indexing with the chosen ordered pipeline
- [x] 6.4 Route: indexing status (so the UI can show progress, "in the background")
- [x] 6.5 Route: get metrics
- [x] 6.6 Route: save indexes
- [x] 6.7 Enable CORS so the frontend can call it

## Phase 7 — Frontend 🤖 (very modern design, smooth animations)
> Built early against fake data in `frontend/src/mocks/`, then connected to the real API in Phase 8.
- [x] 7.1 🤖 Design direction chosen with you: clean and airy, mostly white; blue = main (lines, borders, active), orange = highlight (key button, progress, accents); React + Vite + Tailwind + Framer Motion, TypeScript; UI in English. Full overnight brief in `frontend_prompt.md`
- [x] 7.2 🤖 Project setup (React + Vite) and design system (colors, fonts; light theme only, as decided)
- [x] 7.3 🤖 App layout and navigation (admin dashboard)
- [x] 7.4 🤖 Data panel: "Select documents" button, subset info
- [x] 7.5 🤖 Pipeline builder: tick steps **and drag to reorder** them
- [x] 7.6 🤖 "Generate indexes" button with animated progress
- [x] 7.7 🤖 Metrics dashboard: vocabulary size, document count, memory cards and a matrix-vs-list chart
- [x] 7.8 🤖 Save panel (choose format, confirm, success animation)
- [x] 7.9 🤖 Loading, empty and error states; responsive layout; final animation polish

## Phase 8 — Integration and testing
- [x] 8.1 ✋ Run backend and frontend together
- [x] 8.2 🤖 Replace mocks by real API calls
- [ ] 8.3 ✋ Try different pipeline orders and check results make sense
- [ ] 8.4 ✋ Fix bugs, run all tests

## Phase 9 — Report and review preparation ✋ (Claude helps)
- [ ] 9.1 Architecture description + diagram
- [ ] 9.2 Screenshots of the interface with explanations
- [ ] 9.3 Section: features not done and why
- [ ] 9.4 Section: main difficulties and how you solved them
- [ ] 9.5 Practice explaining every function (the in-person review: live questions and changes)

## Phase 10 — Admin / User split, Auth, Dataset switch, Vercel 🤖 (Claude builds, at your request)

**Golden rule:** `nlp/`, `indexing/`, `monitoring/` and `storage/` are **not changed**. New code only *calls* their functions.
Decisions taken in the Q&A (2026-11-07) are in brackets.

### 10.1 Backend — dataset loading (CSV / XML)
- [x] `config.py`: add `XML_DIR = corpus/xml/` and read the new env settings
- [x] New `data/xml_loader.py`: reads the Reuters `.sgm`/`.xml` files by hand (`str.find`, no `re`), one doc per `<REUTERS>` block, id from `NEWID`, **keeps the tags in the text** so Tag cleaning has work to do
- [x] `api/state.py`: documents cached **per dataset**; `xml_available()` = folder has files [auto-detect]
- [x] `GET /api/datasets` → `{csv: {available, total}, xml: {available, total}}`
- [x] `dataset` field added to documents / preview / indexing requests
- [x] Server rules (400 with a clear message): Tag cleaning **forbidden with CSV**; Stemming **and** Lemmatization **never together**

### 10.2 Backend — auth (new `auth/` folder, stdlib only)
- [x] `auth/passwords.py`: salted hash with `hashlib.pbkdf2_hmac`
- [x] `auth/tokens.py`: signed login token (HMAC-SHA256, 8 h), role inside (`admin` / `user`)
- [x] `auth/accounts.py`: 1 admin + 1 user, defaults from env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `USER_EMAIL`, `USER_PASSWORD`, `AUTH_SECRET`)
- [x] Forgot password **[demo mode]**: 6-digit code (10 min, 5 tries, stored hashed) returned in the response and shown on screen
- [x] `store.py`: tiny key-value store → **Upstash Redis** (REST, via `urllib`) when its env vars exist, else a local JSON file (git-ignored) [Upstash]
- [x] Routes: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/forgot`, `POST /api/auth/reset`; `require_admin` / `require_user` guards on every route

### 10.3 Backend — stateless API (works on Vercel)
- [x] All routes under `/api`
- [x] `POST /api/indexing/run` → **one request** that streams progress lines, then the metrics at the end (replaces thread + `/indexing/status` + `/metrics`)
- [x] Guards: `MAX_DOCUMENTS_ONLINE` from `.env` (empty = no cap; online = 1500) **and** a RAM estimate (`8 matrices × docs × vocabulary × 8 bytes`) vs `MEMORY_BUDGET_MB` → friendly 400
- [x] `POST /api/indexes/download` → rebuild with the same settings + zip (LZMA, ~3 MB at 1500 docs, under Vercel's 4.5 MB) using `storage.save_indexes` in a temp folder [rebuild + zip]
- [x] Admin "save to `saved_indexes/`" kept **only when running locally**
- [x] `POST /api/settings/publish` (admin) and `GET /api/settings/published` → `{dataset, pipeline, max_documents_for_users, published_at}` [Publish button]
- [x] `POST /api/user/run` + `POST /api/user/download`: the user only sends `n_documents` (+ format); the server uses the published settings
- [x] `GET /api/config` → `{max_documents_online, local}`

### 10.4 Frontend — routing + auth screens (same style, better design)
- [x] `react-router-dom`: `/login`, `/forgot-password`, `/admin` (admin only), `/app` (user only), `/` → redirect by role
- [x] Auth context: token saved in the browser, auto-logout on 401
- [x] Login: polished split screen (brand visual + form), show/hide password, errors, smooth motion
- [x] Forgot password: 3 animated steps (email → code shown in a "demo" toast → new password)
- [x] Top bar: role badge, name, logout

### 10.5 Frontend — admin page
- [x] Order: **Dataset → Docs → Pipeline → Index → Metrics → Save → Publish**
- [x] Dataset step: nice switch **CSV (Kaggle) / XML (Reuters)** + "XML files not found yet" badge; Generate disabled with a message when XML is missing
- [x] Pipeline rules: CSV → Tag cleaning **off, greyed, lock icon + tooltip**; Stemming ↔ Lemmatization: ticking one removes and greys the other
- [x] Slider cap: stops at the online cap with a red message ("the online server doesn't have enough memory for more…")
- [x] Indexing panel reads the streamed progress
- [x] Save step → Download zip (json/text/binary) + "Save on server disk" (local only)
- [x] Publish step: summary of what users will get + max docs for users + Publish button + "Published ✓"

### 10.6 Frontend — user page
- [x] One clean screen: greeting → read-only card of the published settings → docs slider (cap = admin max and online cap, red message) → big **Run** button
- [x] Animated progress per model → results: stat tiles + memory chart (reused) → Download zip with format picker

### 10.7 Checks
- [x] Mocks updated so `VITE_USE_MOCKS=true` still works
- [x] New backend tests (auth, XML loader, guards) + the 18 old tests still pass
- [x] Tried in the browser: both roles, forgot password, CSV/XML rules, cap message, phone width

### 10.8 Deploy-ready (whole `RI/` folder = the GitHub repo) [Vercel only]
- [x] `RI/.gitignore` (`.venv`, `node_modules`, `dist`, `saved_indexes`, local store, `.env`)
- [x] `tp1/vercel.json` (Vercel "Root Directory" = `tp1`): build the frontend, Python function `tp1/api/index.py` that loads the FastAPI app, include the corpus files, `/api/*` → function, other paths → React
- [x] `tp1/requirements.txt` for Vercel; frontend calls `/api` in production (same domain, no CORS)
- [x] `DEPLOY.md`: push to GitHub, import in Vercel, add Upstash Redis, set env vars
- [x] Update `CLAUDE.md` + this file

---

## Progress log
| Date | What was done |
|------|---------------|
| 2026-10-19 | Plan and structure created |
| 2026-10-19 | Phase 0 done: venv, requirements.txt, CSV chosen, N=500 for dev |
| 2026-10-19 | Phase 7 done (7.2 → 7.9): frontend built in `frontend/` with fake data (React + Vite + TS + Tailwind + Framer Motion + dnd-kit). Tested in browser at desktop and phone width. API contract in `frontend/src/api/README.md`. Run: `cd frontend && npm install && npm run dev` |
| 2026-11-01 | Phases 1–6 + 8.1/8.2 done. At your request Claude wrote the Python code (one tiny function per step) in `backend/nlp/`, `indexing/`, `monitoring/`, `storage/`, `api/`; 18 tests pass (`python -m pytest tests` in `backend/`). Frontend now uses the real API (`VITE_USE_MOCKS=false`). Still open: 8.3 (try pipeline orders), 8.4 (bugs), Phase 9 (report). Run: see "How to run" in `CLAUDE.md` |
| 2026-11-01 | Added "Try the pipeline on a document" panel (Pipeline section): random document button + id box, shows the text after every step, word counts and final tokens; refreshes by itself when steps/order change. Backend: `POST /pipeline/preview` (`api/routes_pipeline.py`, `nlp/pipeline.py: trace_pipeline`). Helps with 8.3 |
| 2026-11-07 | Phase 10 done: login (1 admin + 1 user, signed token, demo forgot-password), admin console with a CSV/XML Dataset step and a Publish step, pipeline rules (CSV locks Tag cleaning, Stemming/Lemmatization exclusive), one-screen user page (count → Run → metrics → download .zip), streamed indexing, online cap + RAM guard, Vercel setup (`vercel.json`, `api/index.py`, `DEPLOY.md`). XML `.sgm` files extracted to `corpus/xml/`. 30 tests pass. Not deployed yet. |
