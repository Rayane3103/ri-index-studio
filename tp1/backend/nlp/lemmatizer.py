# A simplified lemmatizer: a small dictionary of irregular words + a few rules.
# Unlike the stemmer, the result should be a real word: "children" -> "child", "trading" -> "trade".

# Irregular words that no rule can find
EXCEPTIONS = {
    "went": "go", "gone": "go", "goes": "go",
    "better": "good", "best": "good",
    "was": "be", "were": "be", "been": "be", "being": "be", "is": "be", "are": "be", "am": "be",
    "has": "have", "had": "have", "having": "have",
    "did": "do", "done": "do", "does": "do",
    "bought": "buy", "sold": "sell", "made": "make", "took": "take", "got": "get",
    "men": "man", "women": "woman", "children": "child", "people": "person",
    "mice": "mouse", "feet": "foot", "teeth": "tooth",
}


def lemmatize_plural(word):
    """companies -> company, boxes -> box, shares -> share"""
    if word.endswith("ies") and len(word) > 4:
        return word[:-3] + "y"
    if word.endswith(("sses", "ches", "shes", "xes", "zes")):
        return word[:-2]
    if word.endswith("s") and not word.endswith(("ss", "us", "is")) and len(word) > 3:
        return word[:-1]
    return word


def restore_ending(stem):
    """After removing -ed / -ing: 'hopp' -> 'hop', 'trad' -> 'trade', 'increas' -> 'increase'"""
    if len(stem) > 1 and stem[-1] == stem[-2] and stem[-1] not in "aeioulsz":
        return stem[:-1]
    if stem.endswith(("at", "bl", "iz", "v", "ad", "ud")):
        return stem + "e"
    if stem.endswith("s") and not stem.endswith(("ss", "us")):
        return stem + "e"
    return stem


def lemmatize_verb(word):
    """trading -> trade, traded -> trade, studied -> study"""
    if word.endswith("ied") and len(word) > 4:
        return word[:-3] + "y"
    for ending in ("ing", "ed"):
        if word.endswith(ending):
            stem = word[:-len(ending)]
            if len(stem) >= 3 and any(char in "aeiou" for char in stem):
                return restore_ending(stem)
    return word


def lemmatize_word(word):
    """First look in the exceptions dictionary, then try the plural rules, then the verb rules."""
    if word in EXCEPTIONS:
        return EXCEPTIONS[word]
    if len(word) <= 3:
        return word
    word = lemmatize_plural(word)
    word = lemmatize_verb(word)
    return word


def lemmatize_text(text):
    return " ".join(lemmatize_word(word) for word in text.split())
