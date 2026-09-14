"""Rule-based recommendation engine — assembles actionable text from engine outputs."""
import json
from pathlib import Path
from .disruption import get_reroute
from .fleet import match_to_shipment
from .cold_chain import get_excursions, classify_severity

_DATA = Path(__file__).parent.parent / "data"

def _load(name: str) -> list:
    return json.loads((_DATA / name).read_text())


def generate_recommendation(shipment_id: str) -> dict:
    shipments = _load("shipments.json")
    shipment  = next((s for s in shipments if s["id"] == shipment_id), None)
    if not shipment:
        return {"shipment_id": shipment_id, "recommendation": "Shipment not found.", "actions": []}

    actions = []
    reroute = get_reroute(shipment_id)
    if reroute:
        actions.append(
            f"Reroute via {reroute['via']}: {reroute['description']} "
            f"(+{reroute['extra_delay_hours']}h vs current delay of {shipment['estimated_delay_hours']}h)."
        )

    asset = match_to_shipment(shipment_id)
    if asset and shipment["status"] == "delayed":
        actions.append(
            f"Assign idle {asset['type']} {asset['id']} (at {asset['location']}) "
            f"with {asset['capacity_tonnes']}t capacity to this shipment."
        )

    if shipment["cold_chain"]:
        sensors = _load("sensors.json")
        reading = next((r for r in sensors if r["shipment_id"] == shipment_id), None)
        if reading:
            severity = classify_severity(reading)
            if severity != "OK":
                actions.append(
                    f"COLD CHAIN {severity}: Current temp {reading['current_temp_c']}°C is outside "
                    f"required {reading['required_min_c']}–{reading['required_max_c']}°C range "
                    f"for {reading['breach_duration_hours']}h. Immediate intervention required."
                )

    if not actions:
        summary = f"Shipment {shipment_id} is on time with no active issues."
    else:
        summary = f"Shipment {shipment_id} requires attention: {len(actions)} action(s) recommended."

    return {"shipment_id": shipment_id, "recommendation": summary, "actions": actions}
