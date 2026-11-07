def clean_tags(text):
    """Remove every tag like <BODY> or <a href="x">. We walk the text character by character."""
    result = []
    inside_tag = False
    for char in text:
        if char == "<":
            inside_tag = True
        elif char == ">" and inside_tag:
            inside_tag = False
            result.append(" ")  # a space, so the words around the tag do not stick together
        elif not inside_tag:
            result.append(char)
    return "".join(result)
