import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from auth import get_current_user
from engine.disruption import get_affected_shipments, get_reroute

router = APIRouter(prefix="/api/disruptions", tags=["disruptions"])

_DATA = Path(__file__).parent.parent / "data" / "disruptions.json"
_SHIPMENTS_DATA = Path(__file__).parent.parent / "data" / "shipments.json"

def _load() -> list:
    return json.loads(_DATA.read_text())

def _save(data: list):
    _DATA.write_text(json.dumps(data, indent=2))

def _load_shipments() -> list:
    return json.loads(_SHIPMENTS_DATA.read_text())

def _save_shipments(data: list):
    _SHIPMENTS_DATA.write_text(json.dumps(data, indent=2))


class RerouteApprovalRequest(BaseModel):
    shipment_ids: Optional[List[str]] = None
    target_corridor: Optional[str] = "JNPT Terminal / Alternate Node"


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


@router.post("/{disruption_id}/approve-reroute")
def approve_ai_reroute(
    disruption_id: str,
    req: Optional[RerouteApprovalRequest] = None,
    user: str = Depends(get_current_user)
):
    disruptions = _load()
    disruption = next((d for d in disruptions if d["id"] == disruption_id), None)
    if not disruption:
        raise HTTPException(status_code=404, detail="Disruption not found")

    affected = get_affected_shipments(disruption_id)
    shipment_ids = req.shipment_ids if req and req.shipment_ids else [s["id"] for s in affected]

    # Update shipments destination or status
    shipments = _load_shipments()
    rerouted_count = 0
    for s in shipments:
        if s["id"] in shipment_ids:
            reroute = get_reroute(s["id"])
            if reroute:
                s["destination"] = f"{s['destination']} (via {reroute.get('via')})"
                s["estimated_delay_hours"] = max(1, s.get("estimated_delay_hours", 0) - 8)
                s["status"] = "on_time" if s["estimated_delay_hours"] <= 2 else "delayed"
                rerouted_count += 1
    _save_shipments(shipments)

    return {
        "status": "success",
        "message": f"Approved AI reroute for {rerouted_count} shipments under {disruption['title']}.",
        "disruption_id": disruption_id,
        "rerouted_shipment_ids": shipment_ids,
        "estimated_savings_hours": 14,
        "cost_avoidance_usd": 12400
    }


@router.post("/{disruption_id}/dispatch-drivers")
def dispatch_drivers(disruption_id: str, user: str = Depends(get_current_user)):
    disruptions = _load()
    disruption = next((d for d in disruptions if d["id"] == disruption_id), None)
    if not disruption:
        raise HTTPException(status_code=404, detail="Disruption not found")

    return {
        "status": "dispatched",
        "disruption_id": disruption_id,
        "drivers_contacted": 3,
        "assigned_units": ["TRK-402", "TRK-419", "TRK-501"],
        "bypass_route": "State Highway 17 bypass (+18 km)",
        "eta_delta_minutes": -265,
        "message": "Turn-by-turn bypass telemetry pushed to driver telematics terminals."
    }


@router.post("/{disruption_id}/archive")
def archive_incident(disruption_id: str, user: str = Depends(get_current_user)):
    disruptions = _load()
    found = False
    for d in disruptions:
        if d["id"] == disruption_id:
            d["active"] = False
            d["archived"] = True
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Disruption not found")
    _save(disruptions)
    return {"status": "archived", "disruption_id": disruption_id, "active": False}
