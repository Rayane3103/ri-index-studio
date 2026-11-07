"""The two accounts (one admin, one user) and the "forgot password" codes.
Default passwords come from env vars. A changed password is saved (hashed) in the store and wins."""
import hashlib
import hmac
import secrets
import time

import store
from auth.passwords import check_password, hash_password
from config import ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, USER_EMAIL, USER_NAME, USER_PASSWORD

CODE_LIFETIME_SECONDS = 10 * 60
MAX_CODE_TRIES = 5
MIN_PASSWORD_LENGTH = 8

ACCOUNTS = [
    {"email": ADMIN_EMAIL.lower(), "name": ADMIN_NAME, "role": "admin", "default_password": ADMIN_PASSWORD},
    {"email": USER_EMAIL.lower(), "name": USER_NAME, "role": "user", "default_password": USER_PASSWORD},
]


def public(account):
    return {"email": account["email"], "name": account["name"], "role": account["role"]}


def find_account(email):
    email = email.strip().lower()
    for account in ACCOUNTS:
        if account["email"] == email:
            return account
    return None


def authenticate(email, password):
    """The account if the email + password are right, else None."""
    account = find_account(email)
    if account is None:
        return None
    saved_hash = store.get("password:" + account["email"])
    if saved_hash is not None:
        return account if check_password(password, saved_hash) else None
    default = account["default_password"]
    if default is None:
        return None
    return account if hmac.compare_digest(password.encode(), default.encode()) else None


def _hash_code(code):
    return hashlib.sha256(code.encode()).hexdigest()


def create_reset_code(account):
    """A 6-digit code, valid 10 minutes. Only its hash is saved."""
    code = f"{secrets.randbelow(1_000_000):06d}"
    store.set("reset:" + account["email"], {
        "code_hash": _hash_code(code),
        "expires_at": time.time() + CODE_LIFETIME_SECONDS,
        "tries": 0,
    })
    return code


def reset_password(account, code, new_password):
    """Returns None if it worked, else the error message to show."""
    key = "reset:" + account["email"]
    saved = store.get(key)
    if saved is None or saved["expires_at"] < time.time():
        return "This code has expired. Ask for a new one."
    if saved["tries"] >= MAX_CODE_TRIES:
        store.delete(key)
        return "Too many wrong codes. Ask for a new one."
    if not hmac.compare_digest(_hash_code(code.strip()), saved["code_hash"]):
        saved["tries"] += 1
        store.set(key, saved)
        return "This code is not right."
    if len(new_password) < MIN_PASSWORD_LENGTH:
        return f"The new password needs at least {MIN_PASSWORD_LENGTH} characters."

    store.set("password:" + account["email"], hash_password(new_password))
    store.delete(key)
    return None
