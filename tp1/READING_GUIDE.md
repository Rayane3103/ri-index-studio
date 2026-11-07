# Reading guide: NLP + Indexing

All files are in `backend/`. Read them in this order.

## The big picture (one sentence)

A document text goes **through the NLP steps** and becomes a **list of words (tokens)**.
Then the **indexing** part turns the token lists of all documents into **4 models × 3 structures = 12 indexes**.

```
CSV ──► text ──► [NLP steps, in the admin's order] ──► tokens ──► [indexing] ──► 12 indexes
```

---

## Part 1: NLP (text → text → tokens)

Every step is a tiny function: **it takes a text and gives back a text**. This is why the admin can put them in any order.

| # | File | What it does | Example |
|---|------|--------------|---------|
| 1 | `nlp/tag_cleaning.py` | Walks the text char by char. Everything between `<` and `>` is dropped. | `<b>Oil</b> up` → `Oil  up` |
| 2 | `nlp/normalization.py` | Lowercase, then every non-letter becomes a space, then extra spaces removed. | `Oil, up 5%!` → `oil up` |
| 3 | `nlp/stopwords.py` (+ `stopwords.txt`) | Loads the word list into a `set` once, then drops those words. | `the oil is up` → `oil` |
| 4 | `nlp/stemmer.py` | Cuts word endings with rules (plural, -ed/-ing, -ness…, final e). Result may not be a real word. | `trading` → `trad` |
| 5 | `nlp/lemmatizer.py` | Dictionary of irregular words first, then plural + verb rules. Result is a real word. | `children` → `child`, `trading` → `trade` |
| 6 | `nlp/pipeline.py` | **Read last.** `STEPS` maps an id to a function. `run_pipeline` applies them in order, `trace_pipeline` keeps the text after each step (for the UI preview), `preprocess` = run + split on spaces. | `preprocess(text, ["normalize","stopwords"])` → `["oil", ...]` |

Tip for the review: in `stemmer.py` and `lemmatizer.py`, read `stem_word` / `lemmatize_word` first (the main function at the bottom), then the small helpers it calls.

---

## Part 2: Indexing (tokens → 12 indexes)

Input: `docs_tokens` = one list of tokens per document, and `doc_ids`.

| # | File | What it does |
|---|------|--------------|
| 1 | `indexing/vocabulary.py` | `build_vocabulary`: all different words, sorted. `build_positions`: word → its column number. |
| 2 | `indexing/weighting.py` | `count_terms`: `{word: count}` for one doc. Then the 4 models on that dict: **BoW** = 1, **F** = count, **TF** = count / max count, **TF-IDF** = TF × log10(N / df). `compute_weights` picks the model. |
| 3 | `indexing/matrices.py` | **Doc-term matrix**: one row per doc, one column per word (mostly zeros). **Term-doc matrix**: the same thing flipped (`zip(*matrix)`). |
| 4 | `indexing/inverted_index.py` | For each word: the list of `[doc_id, weight]` where it appears. Only non-zero cells → much smaller. |
| 5 | `indexing/builder.py` | **Read last.** Glues everything: vocabulary → counts → idf → for each of the 4 models, build the 3 structures, and call `on_progress` after each one (that is the progress bar). |

Tiny example with 2 docs: `d1 = [oil, oil, price]`, `d2 = [price]`

- vocabulary = `[oil, price]`
- F weights: d1 = `{oil: 2, price: 1}`, d2 = `{price: 1}`
- doc-term matrix (F) = `[[2, 1], [0, 1]]` · term-doc = `[[2, 0], [1, 1]]`
- inverted index (F) = `{oil: [[d1, 2]], price: [[d1, 1], [d2, 1]]}`
- IDF of `price` = log10(2/2) = 0 → its TF-IDF weight is 0 everywhere.

---

## After that (optional, to see who calls what)

`api/build.py` → `prepare` loads the docs and calls `preprocess` on each one, then `stream_build` calls `build_indexes`. This is the only place where NLP and indexing meet.

The XML dataset is read by `data/xml_loader.py` (the CSV by `data/loader.py`): both give the same `{"id", "title", "text"}` list, so NLP and indexing do not care which one is used.
