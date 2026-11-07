# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working rules (set by the user — always follow)

**Who builds what**
- The user does **not** want to vibe code the project logic. Claude helps structure the project and the user writes the core code themselves, step by step, together with Claude.
- **Claude builds the interface/frontend** (the user just prompts it). Everything else (NLP pipeline, indexing, weighting models, serialization, monitoring logic, backend glue) is the **user's manual work**: Claude explains, guides, gives hints and small code examples, reviews — but does not write the full solution unless the user asks. The user must be able to explain every function in the in-person review.
- Keep the "from scratch" spirit of the assignment (no NLTK/spaCy/`re` for the core NLP).

- **Never create the folder structure or empty files upfront.** Go file by file, folder by folder: create a file only when the code being written needs it (then create the next one when needed). The layout in `plan.md` is only the target.

**How to talk**
- Always use very simple, easy English.
- Whenever planning, designing the frontend, or helping with logic/code, **use multiple-choice questions** (AskUserQuestion) to understand the user, and propose the recommended option first.

**Planning and progress**
- `plan.md` (project root) is the single source of truth: phases → steps → sub-steps, each marked as 🤖 (Claude builds: frontend/interface) or ✋ (user's manual work), with progress checkboxes. Keep it updated after every finished step, from any chat tab.
- When the user says **"next step"** (even in a brand-new chat): read `plan.md`, find the next unfinished step, and explain it shortly.
  - If it is a 🤖 vibe-coding task: explain it and **wait for the user's green light** before building.
  - If it is a ✋ manual task: explain it clearly and give a nice guide plus code hints (not the full solution).

**Frontend design**
- Use the professional Claude design skills (e.g. `frontend-design`, `artifact-design`) and aim for a very modern look with smooth animations and polish.

**Agreed stack:** Python backend (FastAPI, written from scratch, organized by layers: `data/`, `nlp/`, `indexing/`, `monitoring/`, `storage/`, `api/`) + React frontend in `frontend/`. See `plan.md` for the folder layout and all steps.

## State of the repository

This is a coursework folder for an Information Retrieval (Recherche d'Information, "RI") project, part 1 of 3. There is no git history. The backend (Python/FastAPI) and the frontend (React) are both built and connected (at the user's request, Claude wrote the backend code too).

**Where is the code of...** (one tiny function per step, so it is easy to explain)

| Topic | File (in `backend/`) |
|---|---|
| Read the CSV / the XML (`.sgm`) files | `data/loader.py`, `data/xml_loader.py` (both give `{"id", "title", "text"}`; XML keeps the tags) |
| Tag cleaning / Normalization | `nlp/tag_cleaning.py`, `nlp/normalization.py` |
| Stopwords (list in `nlp/stopwords.txt`) | `nlp/stopwords.py` |
| Stemming / Lemmatization | `nlp/stemmer.py`, `nlp/lemmatizer.py` |
| Run the steps in the chosen order | `nlp/pipeline.py` (every step is text → text, so any order works; `trace_pipeline` keeps the text after each step for the UI preview) |
| Vocabulary | `indexing/vocabulary.py` |
| BoW / F / TF / TF-IDF formulas | `indexing/weighting.py` |
| Document-term and term-document matrices | `indexing/matrices.py` |
| Inverted index | `indexing/inverted_index.py` |
| Build all 4 models × 3 structures | `indexing/builder.py` |
| Memory + vocabulary size | `monitoring/metrics.py` |
| Save / load (json, text, binary) | `storage/serializer.py` |
| API (contract, state, routes, all under `/api`) | `api/schemas.py`, `api/state.py`, `api/routes_*.py`, `main.py` |
| Build shared by admin + user: preprocess → build → stream progress/metrics, rebuild → zip | `api/build.py` |
| Rules (CSV ⇒ no tag cleaning, stem ⊕ lemmatize, online doc cap, RAM estimate) | `api/rules.py` |
| Login token, password hash, the 2 accounts + reset codes | `auth/tokens.py`, `auth/passwords.py`, `auth/accounts.py`; guards in `api/deps.py` |
| Key-value store (Upstash Redis online, `.local_store.json` locally) | `store.py` |
| Paths + env settings (`backend/.env`, see `.env.example`) | `config.py` |

**Golden rule (Phase 10):** `nlp/`, `indexing/`, `monitoring/`, `storage/` were not changed by the admin/user/auth/Vercel work; the new code only calls them.

**Accounts:** one admin + one user, from `backend/.env` locally (git-ignored) and from Vercel env vars online. "Forgot password" is in demo mode (the code is shown on screen).

**How to run** (the `.claude/launch.json` has both servers, or by hand):
- Backend: `cd backend` then `.venv\Scripts\python.exe -m uvicorn main:app --port 8000`
- Frontend: `cd frontend` then `npm run dev`, open http://localhost:5173 (Vite forwards `/api` to port 8000; `frontend/.env`: `VITE_USE_MOCKS=true` = fake data)
- Tests: `cd backend` then `.venv\Scripts\python.exe -m pytest tests` (must run from `backend/` so imports like `from nlp.pipeline import ...` work)
- Indexes saved from the admin "Save on server disk" button go to `saved_indexes/<format>/` (local only).
- Deploy: `DEPLOY.md` (one Vercel project, root `tp1/`: `vercel.json`, `api/index.py`, `requirements.txt`). The GitHub repo is the whole `RI/` folder (`RI/.gitignore`).

## Assignment spec (from the PDF, written in French)

Part 1 of 3 of a semester project (AI engineering, S9, groups of ≤2, 4 weeks): build an **Administrator GUI/Web app for dynamic indexing** of a Reuters-21578 subset. Part 2 (later) adds a Guest/Client search interface plus admin search settings (max query length, matching function e.g. dot product/cosine, top-K), loading the saved indexes from disk — so keep indexing and search logic separate (MVC) and reuse the same NLP preprocessing functions for queries.

Required admin features:
- **Load documents** from local disk.
- **Dynamic NLP pipeline**: the admin ticks which steps to apply *and sets their execution order*. Steps: tag cleaning (SGML/XML), normalization (lowercase, punctuation removal…), stopword removal, stemming, lemmatization.
- **"Generate indexes" button** that builds, in the background, all four weighting models — BoW (binary), F (raw count), TF (normalized, e.g. `tf/max_tf`), TF-IDF — each in three outputs: term-document matrix, document-term matrix (the PDF labels the row/column orientation confusingly; both are required), and inverted index (posting lists).
- **Monitoring** after indexing: vocabulary size, number of indexed documents, RAM used by each index type (matrix vs inverted list).
- **Serialization**: save indexes to disk (binary, text or JSON) so Phase 2 can load them without recomputing.

Constraints: language/GUI library is free, but "from scratch" is strongly preferred and graded as a bonus — avoid NLTK/spaCy and even `re` for complex patterns; hand-code string cleaning, stopword dictionaries, and a basic stemmer. Deliverables: source code, a PDF/Word report (architecture, UI screenshots, unimplemented features with justification, difficulties), and an in-person code-mastery review (live questions/modifications per student).

## Corpus (`corpus/`)

The data is the **Reuters-21578** text categorization collection (Distribution 1.0, D. Lewis), redistributed for research use only. `corpus/README.txt` is the original collection README and documents the format, category sets, and the standard train/test splits.

- `xml/reut2-000.sgm … reut2-021.sgm` — the original SGML files (21 577 docs with text), extracted from the UCI zip; used by the "Reuters XML" dataset.
- `reuters21578_news.csv` (~19 MB) — the main document set, already flattened from the original SGML into CSV. Columns: `(unnamed index), newID, oldID, title, author, data_split, isTopicsAvailable, document_date, dateline, people, places, orgs, exchanges, topic_body, topics`.
  - `topic_body` is the article text (multi-line, quoted CSV field — parse with a real CSV reader, not line splitting).
  - `people`, `places`, `orgs`, `exchanges`, `topics` are stringified Python lists (e.g. `"['usa', 'uruguay']"`); parse with `ast.literal_eval` or equivalent.
  - `data_split` is `TRAIN`/`TEST`/(unused) following the ModApte-style split described in the README; `isTopicsAvailable` flags whether the doc has topic labels.
- `all-{topics,places,people,orgs,exchanges}-strings.lc.txt` — the lowercase category vocabularies per field.
- `cat-descriptions_120396.txt` — descriptions of the categories.
- `feldman-cia-worldfactbook-data.txt` — a contributed CIA World Factbook resource (not part of the core collection).
