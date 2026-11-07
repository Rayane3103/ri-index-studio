from nlp.tag_cleaning import clean_tags
from nlp.normalization import normalize
from nlp.stopwords import remove_stopwords
from nlp.stemmer import stem_text
from nlp.lemmatizer import lemmatize_text

# The step ids are the same as in the frontend. Every step takes a text and gives back a text,
# so the admin can put them in any order.
STEPS = {
    "tag_cleaning": clean_tags,
    "normalize": normalize,
    "stopwords": remove_stopwords,
    "stem": stem_text,
    "lemmatize": lemmatize_text,
}


def run_pipeline(text, steps):
    """Apply the chosen steps one after the other, in the given order."""
    for step in steps:
        text = STEPS[step](text)
    return text


def trace_pipeline(text, steps):
    """Same as run_pipeline, but keeps the text after each step: [{"step": ..., "text": ...}, ...].
    Used to inspect what every step does to a document."""
    trace = []
    for step in steps:
        text = STEPS[step](text)
        trace.append({"step": step, "text": text})
    return trace


def tokenize(text):
    """Cut the text into words on the spaces."""
    return text.split()


def preprocess(text, steps):
    """Text -> list of tokens. This is the function used for documents (and later for user queries)."""
    return tokenize(run_pipeline(text, steps))
