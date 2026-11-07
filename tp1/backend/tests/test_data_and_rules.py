import pytest
from fastapi import HTTPException

from api import rules
from data.xml_loader import decode_entities, parse_document, read_file_documents

BLOCK = (
    '<REUTERS TOPICS="YES" NEWID="7"><DATE>26-FEB-1987</DATE>'
    "<TEXT>&#2;\n<TITLE>OIL &amp; GAS</TITLE><BODY>Prices rose &lt;XOM> said.&#3;</BODY></TEXT></REUTERS>"
)


def test_decode_entities():
    assert decode_entities("a &amp; b &lt;c&gt; &#3;") == "a & b <c> "


def test_parse_document_keeps_the_tags():
    document = parse_document(BLOCK)
    assert document["id"] == 7
    assert document["title"] == "OIL & GAS"
    assert document["text"].startswith("<TITLE>OIL & GAS</TITLE><BODY>")


def test_read_file(tmp_path):
    path = tmp_path / "reut2-000.sgm"
    path.write_text('<!DOCTYPE lewis SYSTEM "lewis.dtd">\n' + BLOCK + "\n" + BLOCK.replace('"7"', '"8"'), encoding="latin-1")
    assert [doc["id"] for doc in read_file_documents(str(path))] == [7, 8]


def raises_400(function, *args):
    with pytest.raises(HTTPException) as error:
        function(*args)
    assert error.value.status_code == 400
    return error.value.detail


def test_pipeline_rules():
    assert "CSV" in raises_400(rules.check_pipeline, "csv", ["tag_cleaning", "normalize"])
    assert "together" in raises_400(rules.check_pipeline, "xml", ["stem", "lemmatize"])
    assert "twice" in raises_400(rules.check_pipeline, "xml", ["normalize", "normalize"])
    rules.check_pipeline("xml", ["tag_cleaning", "normalize", "stem"])  # allowed


def test_document_cap(monkeypatch):
    monkeypatch.setattr(rules, "MAX_DOCUMENTS_ONLINE", 1500)
    rules.check_document_count(1500)
    assert "1500" in raises_400(rules.check_document_count, 1501)


def test_memory_guard(monkeypatch):
    monkeypatch.setattr(rules, "MEMORY_BUDGET_MB", 1500)
    rules.check_memory(1500, 10_000)  # 8 x 1500 x 10000 x 8 bytes = 960 MB
    assert "Normalization" in raises_400(rules.check_memory, 1500, 22_000)  # ~2112 MB
