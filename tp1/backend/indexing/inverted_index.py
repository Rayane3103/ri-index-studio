def build_inverted_index(doc_weights, doc_ids):
    """Inverted index: for each term, the list of the documents that contain it (posting list).
    Result: {term: [[doc_id, weight], [doc_id, weight], ...]}. Only non-empty cells are stored,
    this is why it is much smaller than a matrix."""
    index = {}
    for doc_id, weights in zip(doc_ids, doc_weights):
        for term, weight in weights.items():
            if term not in index:
                index[term] = []
            index[term].append([doc_id, weight])
    return dict(sorted(index.items()))
