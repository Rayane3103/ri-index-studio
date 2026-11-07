import time

import pytest

import store
from auth import accounts
from auth.passwords import check_password, hash_password
from auth.tokens import create_token, read_token


@pytest.fixture(autouse=True)
def temporary_store(tmp_path, monkeypatch):
    """Each test gets its own empty store file, so the real one is never touched."""
    monkeypatch.setattr(store, "LOCAL_STORE_PATH", str(tmp_path / "store.json"))
    monkeypatch.setattr(store, "REDIS_URL", None)


def test_password_hash():
    stored = hash_password("secret123")
    assert "secret123" not in stored
    assert check_password("secret123", stored)
    assert not check_password("secret124", stored)


def test_token_round_trip():
    token = create_token("a@b.c", "admin", "key")
    assert read_token(token, "key")["role"] == "admin"
    assert read_token(token, "other key") is None  # wrong secret
    payload, signature = token.split(".")
    assert read_token(payload + "x." + signature, "key") is None  # changed payload


def test_token_expires(monkeypatch):
    token = create_token("a@b.c", "user", "key")
    monkeypatch.setattr(time, "time", lambda: 10**12)
    assert read_token(token, "key") is None


def test_reset_password_flow():
    account = accounts.ACCOUNTS[1]
    code = accounts.create_reset_code(account)
    wrong = "000000" if code != "000000" else "111111"
    assert accounts.reset_password(account, wrong, "newpassword1") == "This code is not right."
    assert accounts.reset_password(account, code, "short") is not None
    assert accounts.reset_password(account, code, "newpassword1") is None
    assert accounts.authenticate(account["email"], "newpassword1") is account
    assert accounts.reset_password(account, code, "again12345") is not None  # a code works only once


def test_too_many_wrong_codes():
    account = accounts.ACCOUNTS[0]
    code = accounts.create_reset_code(account)
    wrong = "000000" if code != "000000" else "111111"
    for _ in range(accounts.MAX_CODE_TRIES):
        accounts.reset_password(account, wrong, "newpassword1")
    assert accounts.reset_password(account, code, "newpassword1") == "Too many wrong codes. Ask for a new one."


def test_online_without_redis_cannot_save(monkeypatch):
    """On Vercel without Redis: reading gives "nothing saved", saving gives a clear error (not a crash)."""
    monkeypatch.setattr(store, "LOCAL", False)
    assert store.kind() == "none"
    assert store.get("published_settings") is None
    with pytest.raises(store.StoreUnavailable, match="Upstash Redis"):
        store.set("published_settings", {"dataset": "csv"})
    assert accounts.authenticate(accounts.ACCOUNTS[0]["email"], "wrong") is None  # login still works
