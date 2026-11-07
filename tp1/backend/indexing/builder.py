from indexing.vocabulary import build_vocabulary, build_positions
from indexing.weighting import count_terms, compute_idf, compute_weights
from indexing.matrices import build_doc_term_matrix, build_term_doc_matrix
from indexing.inverted_index import build_inverted_index

MODELS = ["bow", "f", "tf", "tfidf"]
STRUCTURES = ["doc_term_matrix", "term_doc_matrix", "inverted_index"]


def build_indexes(docs_tokens, doc_ids, formats=STRUCTURES, on_progress=None):
    """Build the 4 models x the asked structures (4 x 3 = 12 by default).

    Returns (vocabulary, indexes) where indexes[model][structure] is the built index.
    on_progress(model, structure, percent) is called each time a structure is finished."""
    vocabulary = build_vocabulary(docs_tokens)
    positions = build_positions(vocabulary)
    docs_counts = [count_terms(tokens) for tokens in docs_tokens]
    idf = compute_idf(docs_counts)

    indexes = {}
    for model in MODELS:
        doc_weights = compute_weights(model, docs_counts, idf)
        indexes[model] = {}
        doc_term_matrix = None

        for structure in STRUCTURES:
            if structure not in formats:
                continue

            if structure == "doc_term_matrix":
                doc_term_matrix = build_doc_term_matrix(doc_weights, positions)
                indexes[model][structure] = doc_term_matrix
            elif structure == "term_doc_matrix":
                if doc_term_matrix is None:
                    doc_term_matrix = build_doc_term_matrix(doc_weights, positions)
                indexes[model][structure] = build_term_doc_matrix(doc_term_matrix)
            elif structure == "inverted_index":
                indexes[model][structure] = build_inverted_index(doc_weights, doc_ids)

            if on_progress is not None:
                on_progress(model, structure, 100)

    return vocabulary, indexes
