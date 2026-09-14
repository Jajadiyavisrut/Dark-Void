"""JWT helpers, password hashing, mock user store, and auth dependency."""
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY   = os.getenv("JWT_SECRET", "supplyflow-dev-secret-changeme")
ALGORITHM    = "HS256"
EXPIRE_MINS  = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

pwd_ctx    = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer     = HTTPBearer()

# ponytail: in-memory dict — fine for demo, swap for a DB for production
_USERS: dict[str, str] = {}   # username -> hashed_password

# Pre-seed a demo account so the app works without registering
def _seed():
    if "demo" not in _USERS:
        _USERS["demo"] = pwd_ctx.hash("demo123")

_seed()


def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


def create_token(username: str) -> str:
    expire  = datetime.utcnow() + timedelta(minutes=EXPIRE_MINS)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> str:
    """Return username from a valid token, raise 401 otherwise."""
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = data.get("sub")
        if not username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> str:
    """FastAPI dependency — validates Bearer token, returns username."""
    return decode_token(credentials.credentials)


def get_users() -> dict:
    """Expose user store for register/login routers."""
    return _USERS
