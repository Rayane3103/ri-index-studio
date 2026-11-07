def to_lowercase(text):
    return text.lower()


def remove_punctuation_and_numbers(text):
    """Keep only letters. Every other character becomes a space (an apostrophe is just removed)."""
    result = []
    for char in text:
        if char.isalpha():
            result.append(char)
        elif char != "'":
            result.append(" ")
    return "".join(result)


def normalize(text):
    """Lowercase, then remove punctuation and numbers, then clean the extra spaces."""
    text = to_lowercase(text)
    text = remove_punctuation_and_numbers(text)
    return " ".join(text.split())
