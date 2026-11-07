# A simplified Porter stemmer, written by hand.
# The stem does not have to be a real word: "trading", "traded" and "trade" must all give the same stem "trad".

VOWELS = "aeiou"

# (ending to remove, text to put instead). The first rule that matches is used.
SUFFIX_RULES = [
    ("ization", "ize"),
    ("ational", "ate"),
    ("fulness", ""),
    ("ation", "ate"),
    ("ness", ""),
    ("ment", ""),
    ("ful", ""),
]


def has_vowel(word):
    for char in word:
        if char in VOWELS:
            return True
    return False


def stem_plurals(word):
    """classes -> class, companies -> company, shares -> share"""
    if word.endswith("sses"):
        return word[:-2]
    if word.endswith("ies") and len(word) > 4:
        return word[:-3] + "y"
    if word.endswith("s") and not word.endswith(("ss", "us", "is")) and len(word) > 3:
        return word[:-1]
    return word


def fix_stem_end(stem):
    """After removing -ed / -ing: 'hopp' -> 'hop' (double letter) and 'stat' -> 'state' (add the e back)."""
    if stem.endswith(("at", "bl", "iz")):
        return stem + "e"
    if len(stem) > 1 and stem[-1] == stem[-2] and stem[-1] not in VOWELS + "lsz":
        return stem[:-1]
    return stem


def stem_ed_ing(word):
    """trading -> trad, traded -> trad (only if what is left still has a vowel)"""
    for ending in ("ing", "ed"):
        if word.endswith(ending):
            stem = word[:-len(ending)]
            if len(stem) >= 3 and has_vowel(stem):
                return fix_stem_end(stem)
    return word


def stem_suffixes(word):
    """nationalization -> nationalize, happiness -> happi, careful -> care"""
    for ending, replacement in SUFFIX_RULES:
        if word.endswith(ending) and len(word) - len(ending) >= 3:
            return word[:-len(ending)] + replacement
    return word


def remove_final_e(word):
    """trade -> trad, so it matches 'trading' and 'traded'"""
    if word.endswith("e") and len(word) > 4:
        return word[:-1]
    return word


def stem_word(word):
    """Apply all the rules one after the other. Very short words are not changed."""
    if len(word) <= 3:
        return word
    word = stem_plurals(word)
    word = stem_ed_ing(word)
    word = stem_suffixes(word)
    word = remove_final_e(word)
    return word


def stem_text(text):
    return " ".join(stem_word(word) for word in text.split())
