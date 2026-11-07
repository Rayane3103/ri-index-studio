"""Checks done before any work, with messages the frontend can show as they are."""
from fastapi import HTTPException

from api.state import get_all_documents, xml_available
from config import MAX_DOCUMENTS_ONLINE, MEMORY_BUDGET_MB
from indexing.builder import MODELS

MATRICES = len(MODELS) * 2  # doc-term + term-doc for each model
BYTES_PER_CELL = 8  # one pointer per cell in a Python list


def bad_request(message):
    raise HTTPException(status_code=400, detail=message)


def check_dataset(dataset):
    if dataset == "xml" and not xml_available():
        bad_request("The XML files are not there yet. Put the .sgm files in corpus/xml/.")


def check_pipeline(dataset, pipeline):
    if len(set(pipeline)) != len(pipeline):
        bad_request("A step is in the pipeline twice.")
    if dataset == "csv" and "tag_cleaning" in pipeline:
        bad_request("Tag cleaning is not needed with the CSV: it has no tags.")
    if "stem" in pipeline and "lemmatize" in pipeline:
        bad_request("Stemming and lemmatization cannot be used together. Keep one of them.")


def check_document_count(n_documents):
    if MAX_DOCUMENTS_ONLINE is not None and n_documents > MAX_DOCUMENTS_ONLINE:
        bad_request(
            f"The online server does not have enough memory for more than {MAX_DOCUMENTS_ONLINE} documents."
        )


def check_memory(n_documents, vocabulary_size):
    """The matrices are the big part: 8 matrices x documents x words. Refuse before building them."""
    if MEMORY_BUDGET_MB is None:
        return
    needed_mb = MATRICES * n_documents * vocabulary_size * BYTES_PER_CELL / 1_000_000
    if needed_mb > MEMORY_BUDGET_MB:
        bad_request(
            f"These settings give {vocabulary_size} different words: the matrices would need about "
            f"{round(needed_mb)} MB, more than the online server has. "
            "Add the Normalization step or choose fewer documents."
        )


def select_documents(dataset, n_documents):
    check_dataset(dataset)
    check_document_count(n_documents)
    return get_all_documents(dataset)[:n_documents]
