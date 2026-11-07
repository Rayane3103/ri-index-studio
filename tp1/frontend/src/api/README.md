# API contract

The frontend calls the backend only through `src/api/index.ts`.
Types for every request and response are in `src/types/index.ts` (they mirror `backend/api/schemas.py`).

All paths start with `/api`. In dev, Vite forwards `/api` to `http://localhost:8000`; on Vercel it is the same domain.
Switch to fake data in `.env` with `VITE_USE_MOCKS=true` (any password works; an email starting with "admin" is the admin).

Login: send `Authorization: Bearer <token>`. A 401 logs the person out. Errors are `{"detail": "readable message"}`.
Ids: models `bow f tf tfidf` · structures `doc_term_matrix term_doc_matrix inverted_index` · steps `tag_cleaning normalize stopwords stem lemmatize` · datasets `csv xml` · formats `json text binary`.

| Route | Who | What |
|---|---|---|
| `GET /config` | anyone | `{local, max_documents_online}` (`null` = no cap) |
| `POST /auth/login` | anyone | `{email, password}` → `{token, user: {email, name, role}}` |
| `GET /auth/me` | logged in | the account of the token |
| `POST /auth/forgot` | anyone | `{email}` → `{demo_code, expires_in}` (demo mode: the code is shown, not emailed) |
| `POST /auth/reset` | anyone | `{email, code, new_password}` → 204 |
| `GET /datasets` | admin | `{csv: {available, total}, xml: {available, total}}` |
| `GET /documents?dataset=csv&limit=N` | admin | `{total_available, selected, documents: [{id, title, preview}]}` (8 previews) |
| `POST /pipeline/preview` | admin | `{dataset, pipeline, n_documents, doc_id?}` → text after every step + tokens |
| `POST /indexing/run` | admin | `{dataset, n_documents, pipeline}` → **stream**, one JSON per line (below) |
| `POST /indexes/download` | admin | `{dataset, n_documents, pipeline, format}` → `.zip` (built again) |
| `POST /storage/save` | admin, local only | same body → `{format, path, files, size_bytes}` |
| `GET /settings/published` | logged in | `{dataset, pipeline, max_documents_for_users, published_at}` |
| `POST /settings/publish` | admin | `{dataset, pipeline, max_documents_for_users}` → the saved settings |
| `POST /user/run` | logged in | `{n_documents}` → stream, with the published settings |
| `POST /user/download` | logged in | `{n_documents, format}` → `.zip` |

The indexing stream:

```
{"type": "progress", "model": "bow", "structure": "doc_term_matrix", "percent": 8}
... 12 progress lines ...
{"type": "measuring"}
{"type": "done", "metrics": {"vocabulary_size": 9421, "documents_indexed": 500, "memory": {"bow": {"doc_term_matrix": 38400000, ...}, ...}}}
```

or `{"type": "error", "message": "..."}`. Memory values are bytes.

Rules checked by the server (400 with a message): Tag cleaning is refused with the CSV; Stemming and Lemmatization are never together;
more than `MAX_DOCUMENTS_ONLINE` documents, or settings whose matrices would need more than `MEMORY_BUDGET_MB`, are refused.
