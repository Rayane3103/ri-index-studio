"""The work shared by the admin and the user routes: preprocess -> build -> metrics, or -> zip / save.
Nothing is kept after the answer (the server may forget everything between two requests on Vercel),
so "download" builds the indexes again with the same settings."""
import io
import json
import os
import queue
import tempfile
import threading
import zipfile

from api.rules import check_memory, check_pipeline, select_documents
from indexing.builder import MODELS, STRUCTURES, build_indexes
from indexing.vocabulary import build_vocabulary
from monitoring.metrics import compute_metrics
from nlp.pipeline import preprocess
from storage.serializer import save_indexes


def prepare(dataset, n_documents, pipeline):
    """Check everything and run the NLP steps. Raises a 400 (with a clear message) before the slow part."""
    check_pipeline(dataset, pipeline)
    documents = select_documents(dataset, n_documents)
    doc_ids = [doc["id"] for doc in documents]
    docs_tokens = [preprocess(doc["text"], pipeline) for doc in documents]
    check_memory(len(documents), len(build_vocabulary(docs_tokens)))
    return docs_tokens, doc_ids


def stream_build(docs_tokens, doc_ids):
    """Build in a thread and yield one JSON line per event, so the frontend can show the progress:
      {"type": "progress", "model": "tf", "structure": "inverted_index", "percent": 42}
      {"type": "measuring"}                 (the indexes are built, the memory is being measured)
      {"type": "done", "metrics": {...}}    or    {"type": "error", "message": "..."}"""
    events = queue.Queue()
    total = len(MODELS) * len(STRUCTURES)
    finished = {"count": 0}

    def on_progress(model, structure, percent):
        finished["count"] += 1
        events.put({"type": "progress", "model": model, "structure": structure,
                    "percent": round(100 * finished["count"] / total)})

    def work():
        try:
            vocabulary, indexes = build_indexes(docs_tokens, doc_ids, STRUCTURES, on_progress)
            events.put({"type": "measuring"})
            events.put({"type": "done", "metrics": compute_metrics(vocabulary, len(doc_ids), indexes)})
        except MemoryError:
            events.put({"type": "error", "message": "Out of memory while building the indexes. Try fewer documents."})
        except Exception as error:
            events.put({"type": "error", "message": f"Indexing failed: {error}"})
        events.put(None)  # the end

    threading.Thread(target=work, daemon=True).start()
    while True:
        event = events.get()
        if event is None:
            return
        yield json.dumps(event) + "\n"


def save_to_folder(folder, file_format, docs_tokens, doc_ids, pipeline, dataset):
    vocabulary, indexes = build_indexes(docs_tokens, doc_ids)
    settings = {"dataset": dataset, "pipeline": pipeline, "doc_ids": doc_ids}
    return save_indexes(folder, file_format, vocabulary, indexes, settings)


def build_zip(file_format, docs_tokens, doc_ids, pipeline, dataset):
    """All the index files in one .zip (LZMA: the matrices are mostly zeros, so they shrink a lot)."""
    with tempfile.TemporaryDirectory() as folder:
        save_to_folder(folder, file_format, docs_tokens, doc_ids, pipeline, dataset)
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_LZMA) as archive:
            for name in sorted(os.listdir(folder)):
                archive.write(os.path.join(folder, name), name)
    return buffer.getvalue()


def zip_filename(file_format, dataset, n_documents):
    return f"indexes_{dataset}_{n_documents}docs_{file_format}.zip"
