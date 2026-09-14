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

    carriers = sorted(list(set(s.get("carrier") for s in shipments if s.get("carrier"))))
    carrier_efficiency = []
    for c in carriers:
        c_shipments = [s for s in shipments if s.get("carrier") == c]
        c_total = len(c_shipments)
        c_ontime = len([s for s in c_shipments if s.get("status") == "on_time"])
        score = round((c_ontime / max(1, c_total)) * 100) if c_total > 0 else 100
        carrier_efficiency.append({
            "carrier": c,
            "score_pct": score,
            "status": "optimal" if score >= 85 else "warning" if score >= 60 else "critical",
            "total_assigned": c_total,
            "delayed_assigned": c_total - c_ontime,
            "note": "Corridor SLA compliant" if score >= 85 else "Subject to port drayage penalty review"
        })

    return {
        "total_shipments": total,
        "delayed_count": delayed,
        "on_time_count": on_time,
        "cold_chain_count": cold_chain,
        "mesh_latency_ms": 14,
        "network_sla_pct": round((on_time / max(1, total)) * 100, 2),
        "auto_reroute_active": True,
        "carrier_efficiency": carrier_efficiency
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
