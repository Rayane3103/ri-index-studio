"""A tiny key -> JSON value store, for what must survive between two requests
(changed passwords, reset codes, the settings the admin published).

On Vercel the disk is not kept, so we use Upstash Redis through its REST API.
On your PC (no Redis keys) we use a local JSON file instead."""
import json
import os
import urllib.request

from config import LOCAL_STORE_PATH, REDIS_TOKEN, REDIS_URL


def _redis(command):
    """Send one Redis command, e.g. ["GET", "key"], and return its result."""
    request = urllib.request.Request(
        REDIS_URL,
        data=json.dumps(command).encode("utf-8"),
        headers={"Authorization": "Bearer " + REDIS_TOKEN, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read())["result"]


def _read_file():
    if not os.path.exists(LOCAL_STORE_PATH):
        return {}
    with open(LOCAL_STORE_PATH, encoding="utf-8") as file:
        return json.load(file)


def _write_file(data):
    with open(LOCAL_STORE_PATH, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)


def using_redis():
    return REDIS_URL is not None and REDIS_TOKEN is not None


def get(key):
    """The saved value, or None."""
    if using_redis():
        raw = _redis(["GET", key])
        return json.loads(raw) if raw is not None else None
    return _read_file().get(key)


def set(key, value):
    if using_redis():
        _redis(["SET", key, json.dumps(value)])
        return
    data = _read_file()
    data[key] = value
    _write_file(data)


def delete(key):
    if using_redis():
        _redis(["DEL", key])
        return
    data = _read_file()
    data.pop(key, None)
    _write_file(data)
