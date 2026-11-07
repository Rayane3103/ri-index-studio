def build_vocabulary(docs_tokens):
    """The sorted list of all the different terms found in all the documents."""
    terms = set()
    for tokens in docs_tokens:
        terms.update(tokens)
    return sorted(terms)


def build_positions(vocabulary):
    """term -> its position (column or row number) in the matrices."""
    return {term: position for position, term in enumerate(vocabulary)}
