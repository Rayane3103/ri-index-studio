import math

from indexing.builder import build_indexes
from monitoring.metrics import compute_metrics

# A tiny corpus we can check by hand
DOCS = [
    ["cat", "dog", "cat"],
    ["dog", "bird"],
    ["cat", "bird", "bird", "fish"],
]
DOC_IDS = [10, 20, 30]


def build():
    return build_indexes(DOCS, DOC_IDS)


def test_vocabulary_is_sorted():
    vocabulary, _ = build()
    assert vocabulary == ["bird", "cat", "dog", "fish"]


def test_f_model():
    _, indexes = build()
    assert indexes["f"]["doc_term_matrix"] == [[0, 2, 1, 0], [1, 0, 1, 0], [2, 1, 0, 1]]


def test_bow_model():
    _, indexes = build()
    assert indexes["bow"]["doc_term_matrix"] == [[0, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 1]]


def test_tf_model():
    _, indexes = build()
    assert indexes["tf"]["doc_term_matrix"][0] == [0, 1.0, 0.5, 0]  # cat=2 is the max, dog=1 -> 1/2
    assert indexes["tf"]["doc_term_matrix"][2] == [1.0, 0.5, 0, 0.5]


def test_tfidf_model():
    _, indexes = build()
    # "cat" is in 2 documents out of 3, so idf = log10(3/2). In document 1, tf(cat) = 1.
    assert math.isclose(indexes["tfidf"]["doc_term_matrix"][0][1], math.log10(3 / 2))
    # "fish" is in 1 document out of 3: idf = log10(3). In document 3, tf(fish) = 1/2.
    assert math.isclose(indexes["tfidf"]["doc_term_matrix"][2][3], 0.5 * math.log10(3))


def test_term_doc_matrix_is_the_transpose():
    _, indexes = build()
    assert indexes["f"]["term_doc_matrix"] == [[0, 1, 2], [2, 0, 1], [1, 1, 0], [0, 0, 1]]


def test_inverted_index():
    _, indexes = build()
    assert indexes["f"]["inverted_index"]["bird"] == [[20, 1], [30, 2]]
    assert indexes["f"]["inverted_index"]["fish"] == [[30, 1]]


def test_progress_is_reported_for_the_12_structures():
    calls = []
    build_indexes(DOCS, DOC_IDS, on_progress=lambda model, structure, percent: calls.append((model, structure)))
    assert len(calls) == 12


def test_metrics_matrix_is_bigger_than_inverted_index_on_a_sparse_corpus():
    docs = [["word" + str(i)] for i in range(50)]
    vocabulary, indexes = build_indexes(docs, list(range(50)))
    metrics = compute_metrics(vocabulary, 50, indexes)
    assert metrics["vocabulary_size"] == 50
    assert metrics["documents_indexed"] == 50
    memory = metrics["memory"]["f"]
    assert memory["doc_term_matrix"] > memory["inverted_index"]
