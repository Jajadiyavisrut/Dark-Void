import json
from pathlib import Path
from fastapi import APIRouter, Depends
from auth import get_current_user
from engine.fleet import get_idle_assets

router = APIRouter(prefix="/api/fleet", tags=["fleet"])

_DATA = Path(__file__).parent.parent / "data" / "fleet.json"

def _load() -> list:
    return json.loads(_DATA.read_text())


@router.get("")
def list_fleet(user: str = Depends(get_current_user)):
    return _load()


@router.get("/idle")
def list_idle(user: str = Depends(get_current_user)):
    return get_idle_assets()
