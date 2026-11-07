# Overnight prompt — build the frontend (copy everything below into a NEW chat tab)

> Open the new tab in the `tp1` folder so CLAUDE.md and plan.md are loaded.

---

You are working in the `tp1` folder. First read `CLAUDE.md` and `plan.md` completely and follow every rule in them. I (the user) am asleep, so **do not ask me questions**: all design decisions are given below. Work alone until everything is done, then leave a short report.

## Your job
Do **Phase 7** of `plan.md` (steps 7.1 → 7.9): build the whole admin **frontend** in the `frontend/` folder. This is a 🤖 task, so you build it fully. Do **not** touch `backend/` or `corpus/` — the backend is my manual work and does not exist yet. The frontend must work today with **fake data** (`src/mocks/`) and be easy to connect to the real API later.

## What the app is
An administrator interface for a search engine (course project, Information Retrieval). The admin can:
1. **Select documents** from disk and choose how many (N) to use.
2. **Build a preprocessing pipeline**: tick steps AND set their order. Steps: Tag Cleaning, Normalization, Stopwords Removal, Stemming, Lemmatization. The order matters, so the user must be able to **drag to reorder** the selected steps (also give keyboard-accessible up/down buttons).
3. Press **"Generate Indexes"**. The backend builds, in the background, 4 models — **BoW, F, TF, TF-IDF** — each in 3 structures: **Document-Term matrix, Term-Document matrix, Inverted index (posting lists)**. Show animated progress per model (12 structures total).
4. See **monitoring metrics** after indexing: vocabulary size, number of indexed documents, and the **memory (RAM) used by each index type** (matrix vs inverted list), for each model. Show a clear chart comparing matrix vs inverted index memory.
5. **Save indexes to disk** (choose a format: JSON, text, binary) and see a success state.

Include a small header/sidebar and a short "pipeline preview" (e.g. the chosen steps shown as a flow: raw text → step → step → tokens).

## Design decisions (final — do not change)
- **Skills:** before designing, load and follow the professional design skills available: `frontend-design` and `artifact-design` (and `dataviz` for the charts). Follow them seriously.
- **Look:** *clean and airy*, very modern and professional (think Linear / Vercel). Lots of white space, soft shadows, rounded corners, thin lines, subtle polish. No clutter.
- **Colors:** the interface is **mostly white** (white background, white cards, light grey only for subtle separators and muted text, dark neutral for text).
  - **Blue = main color**: borders of active components, focus rings, selected states, primary lines, icons, the charts' main series.
  - **Orange = highlight color**: only for key moments — the **Generate Indexes** button, progress, the "matrix" series vs blue "inverted index" in charts if needed, warnings, small accents.
  - Orange and blue appear **only in lines, borders, outlines, small accents and key buttons** — never large filled backgrounds. Keep large areas white.
  - Light theme only. Define all colors as CSS variables / Tailwind theme tokens in one place.
- **Animations (Framer Motion):** smooth page/section entrance, staggered cards, spring-based drag and drop with a lift effect, animated progress and number count-up on the metrics, animated chart bars, button hover/press feedback, success animation after saving. Respect `prefers-reduced-motion`.
- **Language of the UI text:** English. Keep all UI strings in one file (`src/i18n/en.js` or similar) so French can be added later.
- **Tech:** React + Vite + Tailwind CSS + Framer Motion, `@dnd-kit` for drag and drop, Recharts (or a light SVG chart) for charts, `lucide-react` for icons. JavaScript or TypeScript — choose **TypeScript**. Use pinned, normal, well-known versions. Install packages only inside `frontend/`.
- **Quality bar:** responsive (works on laptop and phone width), accessible (labels, focus states, keyboard use, good contrast, aria for drag/reorder), loading / empty / error states everywhere.

## Code structure (must be clean and easy to read)
Use this layout inside `frontend/src/`: `components/`, `pages/`, `api/`, `mocks/`, `styles/`, `i18n/`, `hooks/`, `types/`. Small files, one component per file, clear names, short helpful comments only where needed. Match the style in `plan.md`.

**API layer (`src/api/`):** write one file with functions for the planned endpoints, with a single flag `USE_MOCKS` (default `true`, read from `.env`). Planned endpoints (the backend will follow this contract later; document it clearly in `src/api/README.md`):
- `GET  /documents?limit=N` — list/choose documents
- `POST /indexing/start` — body: `{ n_documents, pipeline: ["normalize","stopwords","stem"], formats }`
- `GET  /indexing/status` — progress per model/structure (the UI polls it)
- `GET  /metrics` — `{ vocabulary_size, documents_indexed, memory: { [model]: { doc_term_matrix, term_doc_matrix, inverted_index } } }` (bytes)
- `POST /storage/save` — body: `{ format }`

Mocks must be realistic: a vocabulary around 8,000–15,000 for a few hundred docs, matrices using far more memory than inverted indexes (e.g. MBs vs KBs), progress that advances over a few seconds, and a small chance to demo an error state.

## How to work
1. Check that Node and npm are installed (`node -v`). If missing, stop and write that in the report.
2. Create the Vite project in `frontend/`, set up Tailwind, theme tokens, fonts (a clean modern font from Google Fonts).
3. Build step by step following 7.2 → 7.9. After finishing each step, tick it in `plan.md` and add a line to the progress log.
4. **Test it really:** run `npm run build` with no errors; start the dev server and use the built-in browser to open the app, click through the whole flow (select docs → reorder pipeline → generate → metrics → save), check desktop and mobile widths, and fix visual bugs. Take screenshots, look at them critically, and polish until it looks truly professional.
5. Do not commit anything to git. Do not create a git repo.
6. Do not edit `CLAUDE.md` rules. Update only `plan.md` (checkboxes + progress log) and add a short `frontend/README.md` (how to run, how to switch from mocks to the real API).

## Final report (at the end, in very simple English)
- What was built, step by step (which plan.md items are done).
- How to run it (exact commands, in separate code blocks).
- What to improve or what you were unsure about.
- Anything that could not be done and why.
