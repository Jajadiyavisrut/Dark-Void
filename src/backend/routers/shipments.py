import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from engine.disruption import get_affected_shipments, get_reroute
from engine.recommendations import generate_recommendation

router = APIRouter(prefix="/api/shipments", tags=["shipments"])

_DATA = Path(__file__).parent.parent / "data" / "shipments.json"

def _load() -> list:
    return json.loads(_DATA.read_text())


@router.get("")
def list_shipments():
    return _load()


@router.get("/{shipment_id}")
def get_shipment(shipment_id: str):
    shipments = _load()
    shipment = next((s for s in shipments if s["id"] == shipment_id), None)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    reroute = get_reroute(shipment_id)
    recommendation = generate_recommendation(shipment_id)
    return {**shipment, "reroute": reroute, "recommendation": recommendation}
