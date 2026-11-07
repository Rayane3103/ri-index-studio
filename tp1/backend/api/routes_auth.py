from fastapi import APIRouter, Depends, HTTPException, Response

from api.deps import current_account, get_secret
from api.schemas import Account, ForgotRequest, ForgotResponse, LoginRequest, LoginResponse, ResetRequest
from auth.accounts import CODE_LIFETIME_SECONDS, authenticate, create_reset_code, find_account, public, reset_password
from auth.tokens import create_token

router = APIRouter(prefix="/auth")


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    account = authenticate(request.email, request.password)
    if account is None:
        raise HTTPException(status_code=401, detail="Wrong email or password.")
    return {"token": create_token(account["email"], account["role"], get_secret()), "user": public(account)}


@router.get("/me", response_model=Account)
def me(account=Depends(current_account)):
    return public(account)


@router.post("/forgot", response_model=ForgotResponse)
def forgot_password(request: ForgotRequest):
    """Demo mode: the code is sent back and shown on screen (a real app would email it)."""
    account = find_account(request.email)
    if account is None:
        raise HTTPException(status_code=404, detail="No account uses this email.")
    return {"demo_code": create_reset_code(account), "expires_in": CODE_LIFETIME_SECONDS}


@router.post("/reset", status_code=204)
def reset(request: ResetRequest):
    account = find_account(request.email)
    if account is None:
        raise HTTPException(status_code=404, detail="No account uses this email.")
    error = reset_password(account, request.code, request.new_password)
    if error is not None:
        raise HTTPException(status_code=400, detail=error)
    return Response(status_code=204)
