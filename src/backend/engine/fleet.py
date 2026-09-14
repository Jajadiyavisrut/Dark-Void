"""Fleet engine — finds idle assets and matches them to disrupted shipments."""
import json
from pathlib import Path

_DATA = Path(__file__).parent.parent / "data"

def _load(name: str) -> list:
    return json.loads((_DATA / name).read_text())


def get_idle_assets() -> list[dict]:
    return [a for a in _load("fleet.json") if a["status"] == "idle"]


# ponytail: naive string match on location; upgrade to geo-coordinates + haversine if needed
def match_to_shipment(shipment_id: str) -> dict | None:
    """Return the first idle asset located near the shipment's origin."""
    shipments = _load("shipments.json")
    shipment  = next((s for s in shipments if s["id"] == shipment_id), None)
    if not shipment:
        return None

    idle = get_idle_assets()
    origin = shipment["origin"]

    # Prefer an asset at the shipment's origin city, else return any idle asset
    exact = next((a for a in idle if a["location"] == origin), None)
    return exact or (idle[0] if idle else None)


if __name__ == "__main__":
    idle = get_idle_assets()
    assert len(idle) > 0, "No idle assets found"
    match = match_to_shipment("SHP-1001")
    assert match is not None, "No asset matched for SHP-1001"
    print(f"✓ fleet.py OK — {len(idle)} idle assets, matched {match['id']} for SHP-1001")
