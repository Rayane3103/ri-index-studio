"""What the server keeps in memory: the documents of each dataset, read only once.
(Nothing else is kept between two requests, so the API also works on Vercel.)"""
from config import CORPUS_PATH, XML_DIR
from data.loader import load_documents
from data.xml_loader import list_xml_files, load_xml_documents

_documents = {}


def xml_available():
    """True when corpus/xml/ has .sgm or .xml files."""
    return len(list_xml_files(XML_DIR)) > 0


def get_all_documents(dataset="csv"):
    """Read the dataset the first time someone asks, then keep it in memory."""
    if dataset not in _documents:
        if dataset == "xml":
            _documents[dataset] = load_xml_documents(XML_DIR, None)
        else:
            _documents[dataset] = load_documents(CORPUS_PATH, None)
    return _documents[dataset]
