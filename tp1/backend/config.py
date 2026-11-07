import os

# All the paths of the project in one place, so they work from any folder.
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BACKEND_DIR)

CORPUS_PATH = os.path.join(PROJECT_DIR, "corpus", "reuters21578_news.csv")
XML_DIR = os.path.join(PROJECT_DIR, "corpus", "xml")  # the original Reuters .sgm files
STOPWORDS_PATH = os.path.join(BACKEND_DIR, "nlp", "stopwords.txt")
SAVED_INDEXES_DIR = os.path.join(PROJECT_DIR, "saved_indexes")
LOCAL_STORE_PATH = os.path.join(BACKEND_DIR, ".local_store.json")  # accounts + settings when running on your PC


def read_env_file(path):
    """Read 'KEY=value' lines of backend/.env (lines starting with # are comments)."""
    values = {}
    if not os.path.exists(path):
        return values
    with open(path, encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if line == "" or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip()
    return values


_ENV_FILE = read_env_file(os.path.join(BACKEND_DIR, ".env"))


def setting(name, default=None):
    """A real environment variable (set on Vercel) wins over backend/.env."""
    value = os.environ.get(name, _ENV_FILE.get(name, ""))
    return value if value != "" else default


def int_setting(name):
    value = setting(name)
    return int(value) if value is not None else None


# Vercel sets VERCEL=1. On your PC we are "local": no document cap, and saving to disk is allowed.
LOCAL = setting("VERCEL") is None

# Online limits (empty = no limit). See .env.example.
MAX_DOCUMENTS_ONLINE = int_setting("MAX_DOCUMENTS_ONLINE")
MEMORY_BUDGET_MB = int_setting("MEMORY_BUDGET_MB")

# Accounts and login token
AUTH_SECRET = setting("AUTH_SECRET")
ADMIN_EMAIL = setting("ADMIN_EMAIL", "admin@ri.local")
ADMIN_PASSWORD = setting("ADMIN_PASSWORD")
ADMIN_NAME = setting("ADMIN_NAME", "Admin")
USER_EMAIL = setting("USER_EMAIL", "user@ri.local")
USER_PASSWORD = setting("USER_PASSWORD")
USER_NAME = setting("USER_NAME", "User")

# Upstash Redis (the Vercel Marketplace adds KV_REST_API_*, the Upstash console gives UPSTASH_REDIS_REST_*)
REDIS_URL = setting("KV_REST_API_URL") or setting("UPSTASH_REDIS_REST_URL")
REDIS_TOKEN = setting("KV_REST_API_TOKEN") or setting("UPSTASH_REDIS_REST_TOKEN")
