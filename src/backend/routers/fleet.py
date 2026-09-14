import json
from pathlib import Path
from fastapi import APIRouter
from engine.fleet import get_idle_assets

router = APIRouter(prefix="/api/fleet", tags=["fleet"])

_DATA = Path(__file__).parent.parent / "data" / "fleet.json"

def _load() -> list:
    return json.loads(_DATA.read_text())


@router.get("")
def list_fleet():
    return _load()


@router.get("/idle")
def list_idle():
    return get_idle_assets()
