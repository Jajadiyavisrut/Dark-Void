import os
import bcrypt
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY   = os.getenv("JWT_SECRET", "supplyflow-dev-secret-changeme")
ALGORITHM    = "HS256"
EXPIRE_MINS  = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

bearer = HTTPBearer()

# ponytail: in-memory dict — fine for demo, swap for a DB for production
_USERS: dict[str, str] = {}   # username -> hashed_password

# Pre-seed a demo account so the app works without registering
def _seed():
    if "demo" not in _USERS:
        _USERS["demo"] = bcrypt.hashpw(b"demo123", bcrypt.gensalt()).decode()

_seed()


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


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
