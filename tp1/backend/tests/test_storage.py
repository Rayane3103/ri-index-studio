import pytest

from indexing.builder import build_indexes
from storage.serializer import save_indexes, load_indexes

DOCS = [["cat", "dog", "cat"], ["dog", "bird"], ["cat", "bird", "bird", "fish"]]
SETTINGS = {"pipeline": ["normalize"], "doc_ids": [10, 20, 30]}


@pytest.mark.parametrize("file_format", ["json", "text", "binary"])
def test_save_then_load_gives_the_same_indexes(tmp_path, file_format):
    vocabulary, indexes = build_indexes(DOCS, [10, 20, 30])

    result = save_indexes(str(tmp_path), file_format, vocabulary, indexes, SETTINGS)
    loaded_vocabulary, loaded_indexes, loaded_settings = load_indexes(str(tmp_path), file_format)

    assert result["files"] == 14
    assert result["size_bytes"] > 0
    assert loaded_vocabulary == vocabulary
    assert loaded_settings == SETTINGS
    assert loaded_indexes == indexes
