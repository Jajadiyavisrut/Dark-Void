import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user
from engine.disruption import get_affected_shipments, get_reroute

router = APIRouter(prefix="/api/disruptions", tags=["disruptions"])

_DATA = Path(__file__).parent.parent / "data" / "disruptions.json"

def _load() -> list:
    return json.loads(_DATA.read_text())


@router.get("")
def list_disruptions(user: str = Depends(get_current_user)):
    return _load()


@router.get("/{disruption_id}/affected")
def affected_shipments(disruption_id: str, user: str = Depends(get_current_user)):
    disruptions = _load()
    if not any(d["id"] == disruption_id for d in disruptions):
        raise HTTPException(status_code=404, detail="Disruption not found")

    affected = get_affected_shipments(disruption_id)
    enriched = []
    for s in affected:
        reroute = get_reroute(s["id"])
        enriched.append({**s, "reroute": reroute})
    return {"disruption_id": disruption_id, "affected_count": len(enriched), "shipments": enriched}
