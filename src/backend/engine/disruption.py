"""Disruption detection engine — reads JSON, returns affected shipments and reroutes."""
import json
from pathlib import Path

_DATA = Path(__file__).parent.parent / "data"

def _load(name: str) -> list:
    return json.loads((_DATA / name).read_text())

# ponytail: naive O(n) linear scan; fine for ≤10k shipments — switch to indexed graph for more
def get_affected_shipments(disruption_id: str) -> list[dict]:
    disruptions = _load("disruptions.json")
    shipments   = _load("shipments.json")

    dist = next((d for d in disruptions if d["id"] == disruption_id), None)
    if not dist:
        return []

    node = dist["affected_node"]
    return [s for s in shipments if node in s["route"]]


_REROUTES = {
    "PORT-A": {
        "via": "PORT-B",
        "description": "Divert via Port B (Mumbai). Add PORT-B before final destination.",
        "extra_delay_hours": 3,
    },
    "ROAD-BLOCK-1": {
        "via": "NH-44",
        "description": "Use NH-44 bypass via Davangere to reach Bengaluru.",
        "extra_delay_hours": 2,
    },
    "CYCLONE-ZONE-1": {
        "via": "Inland Rail",
        "description": "Switch to inland rail freight to avoid coastal exposure.",
        "extra_delay_hours": 6,
    },
}

def get_reroute(shipment_id: str) -> dict | None:
    shipments   = _load("shipments.json")
    disruptions = _load("disruptions.json")

    shipment = next((s for s in shipments if s["id"] == shipment_id), None)
    if not shipment:
        return None

    active_nodes = {d["affected_node"] for d in disruptions if d["active"]}
    blocked_node = next((n for n in shipment["route"] if n in active_nodes), None)
    if not blocked_node:
        return None

    reroute = _REROUTES.get(blocked_node)
    if not reroute:
        return None

    return {
        "shipment_id": shipment_id,
        "blocked_node": blocked_node,
        **reroute,
    }


if __name__ == "__main__":
    affected = get_affected_shipments("DIST-001")
    assert len(affected) > 0, "No affected shipments found for DIST-001"
    reroute = get_reroute("SHP-1001")
    assert reroute is not None, "No reroute found for SHP-1001"
    assert reroute["via"] == "PORT-B"
    print(f"[OK] disruption.py — {len(affected)} shipments affected by DIST-001, reroute via {reroute['via']}")
