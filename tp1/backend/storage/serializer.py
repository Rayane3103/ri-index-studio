import json
import os
import pickle

from indexing.builder import MODELS, STRUCTURES

# One folder per format: saved_indexes/json/, saved_indexes/text/, saved_indexes/binary/
# Files: 4 models x 3 structures = 12 index files + vocabulary + settings = 14 files.
EXTENSIONS = {"json": ".json", "text": ".txt", "binary": ".bin"}


# ---------- text format helpers (plain readable files) ----------

def matrix_to_text(matrix):
    """One line per matrix row, the numbers separated by spaces."""
    return "\n".join(" ".join(str(value) for value in row) for row in matrix)


def text_to_matrix(text):
    matrix = []
    for line in text.splitlines():
        matrix.append([float(value) if "." in value or "e" in value else int(value) for value in line.split()])
    return matrix


def inverted_to_text(index):
    """One line per term:  term doc_id:weight doc_id:weight ..."""
    lines = []
    for term, postings in index.items():
        pairs = " ".join(str(doc_id) + ":" + str(weight) for doc_id, weight in postings)
        lines.append(term + " " + pairs)
    return "\n".join(lines)


def text_to_inverted(text):
    index = {}
    for line in text.splitlines():
        term, *pairs = line.split()
        postings = []
        for pair in pairs:
            doc_id, weight = pair.split(":")
            postings.append([int(doc_id), float(weight) if "." in weight or "e" in weight else int(weight)])
        index[term] = postings
    return index


# ---------- write / read one file ----------

def write_file(path, data, kind, file_format):
    """kind is 'matrix', 'inverted' or 'words' (a list of words)."""
    if file_format == "json":
        with open(path, "w", encoding="utf-8") as file:
            json.dump(data, file)
    elif file_format == "binary":
        with open(path, "wb") as file:
            pickle.dump(data, file)
    else:
        if kind == "matrix":
            text = matrix_to_text(data)
        elif kind == "inverted":
            text = inverted_to_text(data)
        else:
            text = "\n".join(data)
        with open(path, "w", encoding="utf-8") as file:
            file.write(text)


def read_file(path, kind, file_format):
    if file_format == "json":
        with open(path, encoding="utf-8") as file:
            return json.load(file)
    if file_format == "binary":
        with open(path, "rb") as file:
            return pickle.load(file)
    with open(path, encoding="utf-8") as file:
        text = file.read()
    if kind == "matrix":
        return text_to_matrix(text)
    if kind == "inverted":
        return text_to_inverted(text)
    return text.splitlines()


def kind_of(structure):
    return "inverted" if structure == "inverted_index" else "matrix"


# ---------- save / load everything ----------

def save_indexes(folder, file_format, vocabulary, indexes, settings):
    """Write all the indexes, the vocabulary and the settings (pipeline, doc ids...) in 'folder'.
    Returns {"files": number of files, "size_bytes": total size on disk}."""
    extension = EXTENSIONS[file_format]
    os.makedirs(folder, exist_ok=True)
    paths = []

    for model in MODELS:
        for structure in STRUCTURES:
            if structure in indexes.get(model, {}):
                path = os.path.join(folder, model + "_" + structure + extension)
                write_file(path, indexes[model][structure], kind_of(structure), file_format)
                paths.append(path)

    vocabulary_path = os.path.join(folder, "vocabulary" + extension)
    write_file(vocabulary_path, vocabulary, "words", file_format)
    paths.append(vocabulary_path)

    settings_path = os.path.join(folder, "settings.json")  # always JSON, it is small
    write_file(settings_path, settings, "words", "json")
    paths.append(settings_path)

    return {"files": len(paths), "size_bytes": sum(os.path.getsize(path) for path in paths)}


def load_indexes(folder, file_format):
    """Read back what save_indexes wrote. Returns (vocabulary, indexes, settings). Phase 2 will use this."""
    extension = EXTENSIONS[file_format]
    indexes = {}
    for model in MODELS:
        indexes[model] = {}
        for structure in STRUCTURES:
            path = os.path.join(folder, model + "_" + structure + extension)
            if os.path.exists(path):
                indexes[model][structure] = read_file(path, kind_of(structure), file_format)

    vocabulary = read_file(os.path.join(folder, "vocabulary" + extension), "words", file_format)
    settings = read_file(os.path.join(folder, "settings.json"), "words", "json")
    return vocabulary, indexes, settings
