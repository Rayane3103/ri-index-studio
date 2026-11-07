import sys

from indexing.builder import MODELS, STRUCTURES


def get_size(obj, seen=None):
    """Memory of an object in bytes, including everything inside it (lists, dicts...).
    sys.getsizeof only gives the size of the container, so we go inside ourselves.
    'seen' remembers the objects already counted, so a shared object (like the number 0) is counted once."""
    if seen is None:
        seen = set()
    if id(obj) in seen:
        return 0
    seen.add(id(obj))

    size = sys.getsizeof(obj)
    if isinstance(obj, dict):
        for key, value in obj.items():
            size += get_size(key, seen) + get_size(value, seen)
    elif isinstance(obj, (list, tuple, set)):
        for item in obj:
            size += get_size(item, seen)
    return size


def compute_metrics(vocabulary, n_documents, indexes):
    """Everything the Metrics page needs: vocabulary size, number of documents, memory of each index."""
    memory = {}
    for model in MODELS:
        memory[model] = {}
        for structure in STRUCTURES:
            index = indexes.get(model, {}).get(structure)
            memory[model][structure] = get_size(index) if index is not None else 0
    return {
        "vocabulary_size": len(vocabulary),
        "documents_indexed": n_documents,
        "memory": memory,
    }
