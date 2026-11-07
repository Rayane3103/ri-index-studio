# Reads the original Reuters-21578 files (reut2-000.sgm ... reut2-021.sgm), written by hand without `re`.
# Each file holds about 1000 documents like:
#   <REUTERS ... NEWID="1"> ... <TEXT><TITLE>...</TITLE><DATELINE>...</DATELINE><BODY>...</BODY></TEXT> </REUTERS>
# We keep the tags that are inside <TEXT>, so the "Tag cleaning" step has real work to do.
import os

# The few named entities the files use. Numeric ones like &#3; are control characters: we drop them.
ENTITIES = {"&lt;": "<", "&gt;": ">", "&amp;": "&", "&quot;": '"', "&apos;": "'"}


def find_between(text, start, end, from_position=0):
    """The text between the first `start` and the next `end`. Returns (content, position after end) or (None, -1)."""
    begin = text.find(start, from_position)
    if begin == -1:
        return None, -1
    begin += len(start)
    finish = text.find(end, begin)
    if finish == -1:
        return None, -1
    return text[begin:finish], finish + len(end)


def get_attribute(open_tag, name):
    """get_attribute('<REUTERS NEWID="12">', 'NEWID') -> '12'"""
    value, _ = find_between(open_tag, name + '="', '"')
    return value


def decode_entities(text):
    """&lt; -> <, &amp; -> & ... and drop &#2; style codes."""
    result = []
    position = 0
    while position < len(text):
        char = text[position]
        if char == "&":
            end = text.find(";", position)
            if end != -1 and end - position <= 6:
                entity = text[position:end + 1]
                if entity in ENTITIES:
                    result.append(ENTITIES[entity])
                    position = end + 1
                    continue
                if entity.startswith("&#"):
                    position = end + 1
                    continue
        result.append(char)
        position += 1
    return "".join(result)


def parse_document(block):
    """One <REUTERS ...> ... </REUTERS> block -> {"id", "title", "text"} (or None if it has no text)."""
    open_tag = block[:block.find(">") + 1]
    new_id = get_attribute(open_tag, "NEWID")
    text, _ = find_between(block, "<TEXT", "</TEXT>")
    if new_id is None or text is None:
        return None
    text = text[text.find(">") + 1:]  # skip the end of the <TEXT ...> tag (it can have attributes)
    title, _ = find_between(text, "<TITLE>", "</TITLE>")
    text = decode_entities(text).strip()
    if text == "":
        return None
    return {"id": int(new_id), "title": decode_entities(title or "").strip(), "text": text}


def read_file_documents(path):
    # latin-1 accepts every byte (one file has a few non UTF-8 letters)
    with open(path, encoding="latin-1") as file:
        content = file.read()
    documents = []
    position = 0
    while True:
        block, position = find_between(content, "<REUTERS", "</REUTERS>", position)
        if block is None:
            break
        document = parse_document("<REUTERS" + block)
        if document is not None:
            documents.append(document)
    return documents


def list_xml_files(folder):
    if not os.path.isdir(folder):
        return []
    return sorted(name for name in os.listdir(folder) if name.endswith((".sgm", ".xml")))


def load_xml_documents(folder, limit):
    """All the documents of all the files of the folder, in file order (same output as data/loader.py)."""
    documents = []
    for name in list_xml_files(folder):
        documents.extend(read_file_documents(os.path.join(folder, name)))
        if limit is not None and len(documents) >= limit:
            return documents[:limit]
    return documents
