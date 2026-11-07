"""Who is calling? Every protected route asks for `require_admin` or `require_user`."""
from fastapi import Depends, Header, HTTPException

from auth.accounts import find_account
from auth.tokens import read_token
from config import AUTH_SECRET


def get_secret():
    if AUTH_SECRET is None:
        raise HTTPException(status_code=500, detail="AUTH_SECRET is not set on the server.")
    return AUTH_SECRET


def current_account(authorization: str | None = Header(None)):
    """Reads 'Authorization: Bearer <token>' and returns the account, or answers 401."""
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Please log in.")
    data = read_token(authorization[len("Bearer "):], get_secret())
    account = find_account(data["sub"]) if data is not None else None
    if account is None or account["role"] != data["role"]:
        raise HTTPException(status_code=401, detail="Your session has expired. Please log in again.")
    return account


def require_admin(account=Depends(current_account)):
    if account["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only the admin can do this.")
    return account


def require_user(account=Depends(current_account)):
    """Any logged-in account (the admin can also try the user page)."""
    return account
