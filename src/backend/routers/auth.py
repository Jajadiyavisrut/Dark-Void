from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from auth import hash_password, verify_password, create_token, get_users

router = APIRouter(prefix="/api/auth", tags=["auth"])


class AuthBody(BaseModel):
    username: str
    password: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: AuthBody):
    users = get_users()
    if body.username in users:
        raise HTTPException(status_code=400, detail="Username already exists")
    users[body.username] = hash_password(body.password)
    return {"message": "User registered successfully"}


@router.post("/login")
def login(body: AuthBody):
    users = get_users()
    hashed = users.get(body.username)
    if not hashed or not verify_password(body.password, hashed):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    token = create_token(body.username)
    return {"access_token": token, "token_type": "bearer"}
