import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user
from engine.disruption import get_affected_shipments, get_reroute
from engine.recommendations import generate_recommendation

router = APIRouter(prefix="/api/shipments", tags=["shipments"])

_DATA = Path(__file__).parent.parent / "data" / "shipments.json"

def _load() -> list:
    return json.loads(_DATA.read_text())

def _save(data: list):
    _DATA.write_text(json.dumps(data, indent=2))


@router.get("")
def list_shipments(user: str = Depends(get_current_user)):
    return _load()


@router.get("/analytics")
def get_analytics(user: str = Depends(get_current_user)):
    shipments = _load()
    total = len(shipments)
    delayed = len([s for s in shipments if s.get("status") == "delayed"])
    on_time = len([s for s in shipments if s.get("status") == "on_time"])
    cold_chain = len([s for s in shipments if s.get("cold_chain")])

    return {
        "total_shipments": total,
        "delayed_count": delayed,
        "on_time_count": on_time,
        "cold_chain_count": cold_chain,
        "mesh_latency_ms": 14,
        "network_sla_pct": 99.98,
        "auto_reroute_active": True,
        "carrier_efficiency": [
            {"carrier": "Carrier A", "score_pct": 62, "status": "warning", "note": "Subject to port drayage penalty review"},
            {"carrier": "Carrier B", "score_pct": 99, "status": "optimal", "note": "North corridor highest reliability"},
            {"carrier": "Carrier C", "score_pct": 95, "status": "optimal", "note": "Western express verified"}
        ]
    }


@router.get("/{shipment_id}")
def get_shipment(shipment_id: str, user: str = Depends(get_current_user)):
    shipments = _load()
    shipment = next((s for s in shipments if s["id"] == shipment_id), None)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    reroute = get_reroute(shipment_id)
    recommendation = generate_recommendation(shipment_id)
    return {**shipment, "reroute": reroute, "recommendation": recommendation}


@router.post("/{shipment_id}/apply-reroute")
def apply_reroute(shipment_id: str, user: str = Depends(get_current_user)):
    shipments = _load()
    shipment = next((s for s in shipments if s["id"] == shipment_id), None)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    reroute = get_reroute(shipment_id)
    if not reroute:
        raise HTTPException(status_code=400, detail="No active reroute candidate for this shipment")

    shipment["destination"] = f"{shipment['destination']} (via {reroute.get('via')})"
    shipment["status"] = "on_time"
    shipment["estimated_delay_hours"] = max(0, shipment.get("estimated_delay_hours", 0) - 8)
    _save(shipments)

    return {
        "status": "rerouted",
        "shipment_id": shipment_id,
        "new_route": reroute.get("description"),
        "via": reroute.get("via"),
        "adjusted_delay_hours": shipment["estimated_delay_hours"]
    }
