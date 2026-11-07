# Deploy on Vercel (free)

One Vercel project serves everything: the React app (static files) and the FastAPI backend (one Python function, `api/index.py`).
The GitHub repo is the whole `RI/` folder; Vercel only looks at `tp1/`.

## 1. Push to GitHub

From the `RI/` folder:

```bash
git init
git add .
git commit -m "Index Studio: admin/user apps, auth, dataset switch, Vercel setup"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

`.gitignore` keeps out: `.venv`, `node_modules`, `dist`, `saved_indexes/`, `backend/.env` (your local passwords), `backend/.local_store.json`, and the corpus `.zip` (its `.sgm` files are already in `corpus/xml/`).

> The Reuters-21578 files are "for research use only". A private GitHub repo is the safe choice.

## 2. Create the Vercel project

1. vercel.com → **Add New → Project** → import the repo.
2. **Root Directory: `tp1`** (important).
3. Framework preset: **Other** (the build settings come from `tp1/vercel.json`).
4. Don't deploy yet: first do steps 3 and 4.

## 3. Add the free Redis store (keeps passwords and published settings)

Project → **Storage** → **Upstash for Redis** (Marketplace) → free plan → connect it to the project.
It adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` by itself.

## 4. Environment variables

Project → **Settings → Environment Variables** (see `backend/.env.example`):

| Name | Value |
|---|---|
| `AUTH_SECRET` | a long random text: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | the admin account |
| `USER_EMAIL` / `USER_PASSWORD` / `USER_NAME` | the user account |
| `MAX_DOCUMENTS_ONLINE` | `1500` |
| `MEMORY_BUDGET_MB` | `1500` |

Then **Deploy**.

## 5. Check it

- Open the site → log in as admin → Generate with 500 documents → Download.
- Log in as the user → Run.
- If the progress bar jumps from 0 to 100 at the end: Vercel held back the streamed progress. Everything else still works.

## Limits of the free plan (why the caps exist)

- 2 GB of RAM: the 8 matrices grow like documents × vocabulary, so 1 500 documents is the safe maximum (and the server refuses settings that would need more than `MEMORY_BUDGET_MB`).
- 300 s per request, 4.5 MB per answer: the download is a compressed `.zip` (about 3 MB for 1 500 documents).
- The disk is not kept: "Save on server disk" only works on your PC. Online, use Download.
