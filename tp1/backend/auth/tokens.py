"""The login token: 'payload.signature', both in base64.
The payload says who you are ({"sub": email, "role": ..., "exp": ...}).
The signature is an HMAC of the payload with AUTH_SECRET, so nobody can change the role without the secret."""
import base64
import hashlib
import hmac
import json
import time

LIFETIME_SECONDS = 8 * 60 * 60  # 8 hours


def _encode(data):
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def _decode(text):
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def _sign(payload, secret):
    return _encode(hmac.new(secret.encode("utf-8"), payload.encode("ascii"), hashlib.sha256).digest())


def create_token(email, role, secret):
    payload = _encode(json.dumps({"sub": email, "role": role, "exp": int(time.time()) + LIFETIME_SECONDS}).encode())
    return payload + "." + _sign(payload, secret)


def read_token(token, secret):
    """The payload if the token is valid and not expired, else None."""
    if token.count(".") != 1:
        return None
    payload, signature = token.split(".")
    if not hmac.compare_digest(signature, _sign(payload, secret)):
        return None
    try:
        data = json.loads(_decode(payload))
    except ValueError:
        return None
    if data.get("exp", 0) < time.time():
        return None
    return data
