def build_doc_term_matrix(doc_weights, positions):
    """Document-term matrix: one ROW per document, one COLUMN per term. Most cells are 0."""
    n_terms = len(positions)
    matrix = []
    for weights in doc_weights:
        row = [0] * n_terms
        for term, weight in weights.items():
            row[positions[term]] = weight
        matrix.append(row)
    return matrix


def build_term_doc_matrix(doc_term_matrix):
    """Term-document matrix: one ROW per term, one COLUMN per document. It is the transpose of the other one."""
    return [list(column) for column in zip(*doc_term_matrix)]
