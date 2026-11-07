from nlp.tag_cleaning import clean_tags
from nlp.normalization import normalize
from nlp.stopwords import remove_stopwords
from nlp.stemmer import stem_word
from nlp.lemmatizer import lemmatize_word
from nlp.pipeline import preprocess, trace_pipeline


def test_clean_tags():
    assert clean_tags("<BODY>Hello</BODY> world").split() == ["Hello", "world"]


def test_normalize():
    assert normalize("Hello, World! 1987 it's") == "hello world its"


def test_remove_stopwords():
    assert remove_stopwords("the cat is on the mat") == "cat mat"


def test_stem_word():
    assert stem_word("trading") == stem_word("traded") == stem_word("trade") == "trad"
    assert stem_word("companies") == stem_word("company")
    assert stem_word("classes") == "class"


def test_lemmatize_word():
    assert lemmatize_word("went") == "go"
    assert lemmatize_word("children") == "child"
    assert lemmatize_word("companies") == "company"
    assert lemmatize_word("trading") == "trade"


def test_pipeline_follows_the_given_order():
    text = "<B>The Cats, running!</B>"
    assert preprocess(text, ["tag_cleaning", "normalize", "stopwords", "stem"]) == ["cat", "run"]
    # stopwords BEFORE normalize: "The" still has a capital letter, so it is not removed
    assert preprocess(text, ["tag_cleaning", "stopwords", "normalize"]) == ["the", "cats", "running"]


def test_trace_pipeline_keeps_the_text_after_each_step():
    trace = trace_pipeline("<B>The Cats</B>", ["tag_cleaning", "normalize", "stopwords"])
    assert [item["step"] for item in trace] == ["tag_cleaning", "normalize", "stopwords"]
    assert trace[1]["text"] == "the cats"
    assert trace[2]["text"] == "cats"
    assert trace_pipeline("some text", []) == []
