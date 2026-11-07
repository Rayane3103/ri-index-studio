import csv

def load_documents(path, limit):
    documents = []
    with open(path, encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            body = row["topic_body"].strip()
            if body == "":
                continue
            documents.append({
                "id": int(row["newID"]),
                "title": row["title"].strip(),
                "text": body,
            })
            if len(documents) == limit:
                break
    return documents

if __name__ == "__main__":
    docs = load_documents("../corpus/reuters21578_news.csv", 3)
    for d in docs:
        print(d["id"], d["title"])
        print(d["text"][:100])
        print("---")