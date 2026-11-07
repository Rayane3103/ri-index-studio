import math

# Every function works on ONE document and gives a dictionary {term: weight}.
# Only the terms that are in the document appear (the other weights are 0).


def count_terms(tokens):
    """How many times each term appears in the document: {term: count}."""
    counts = {}
    for token in tokens:
        counts[token] = counts.get(token, 0) + 1
    return counts


def bow_weights(counts):
    """BoW (binary): 1 if the term is in the document."""
    return {term: 1 for term in counts}


def f_weights(counts):
    """F: the raw count of the term."""
    return dict(counts)


def tf_weights(counts):
    """TF: count / count of the most frequent term of the document (the values are between 0 and 1)."""
    if len(counts) == 0:
        return {}
    max_count = max(counts.values())
    return {term: count / max_count for term, count in counts.items()}


def compute_idf(docs_counts):
    """IDF = log10(N / df). df = number of documents that contain the term.
    A term that is in every document gets IDF = 0 (it does not help to tell documents apart)."""
    n_docs = len(docs_counts)
    doc_frequency = {}
    for counts in docs_counts:
        for term in counts:
            doc_frequency[term] = doc_frequency.get(term, 0) + 1
    return {term: math.log10(n_docs / df) for term, df in doc_frequency.items()}


def tfidf_weights(counts, idf):
    """TF-IDF = TF x IDF"""
    tf = tf_weights(counts)
    return {term: tf[term] * idf[term] for term in tf}


def compute_weights(model, docs_counts, idf):
    """The weights of one model for all the documents: a list with one dictionary per document."""
    if model == "bow":
        return [bow_weights(counts) for counts in docs_counts]
    if model == "f":
        return [f_weights(counts) for counts in docs_counts]
    if model == "tf":
        return [tf_weights(counts) for counts in docs_counts]
    if model == "tfidf":
        return [tfidf_weights(counts, idf) for counts in docs_counts]
    raise ValueError("Unknown model: " + model)
