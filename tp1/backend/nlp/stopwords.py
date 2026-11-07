from config import STOPWORDS_PATH


def load_stopwords(path=STOPWORDS_PATH):
    """Read the stopword file (one word per line) into a set. A set makes the lookup very fast."""
    with open(path, encoding="utf-8") as file:
        return {line.strip() for line in file if line.strip() != ""}
#It gives you every unique, non-empty line from a file, without messy spacing.

STOPWORDS = load_stopwords()


def remove_stopwords(text):
    """Keep only the words that are not in the stopword set."""
    kept_words = [word for word in text.split() if word not in STOPWORDS]
    return " ".join(kept_words)
