"""Cold chain engine — detects temperature excursions and classifies severity."""
import json
from pathlib import Path

_DATA = Path(__file__).parent.parent / "data"

def _load(name: str) -> list:
    return json.loads((_DATA / name).read_text())


def _is_breach(reading: dict) -> bool:
    t = reading["current_temp_c"]
    return not (reading["required_min_c"] <= t <= reading["required_max_c"])


def classify_severity(reading: dict) -> str:
    """CRITICAL if temp is breached AND breach has lasted ≥2 hours (regulatory threshold)."""
    if not _is_breach(reading):
        return "OK"
    return "CRITICAL" if reading["breach_duration_hours"] >= 2 else "WARNING"


def get_excursions() -> list[dict]:
    """Return all sensor readings that are breaching required temp, with severity tag."""
    readings = _load("sensors.json")
    result = []
    for r in readings:
        severity = classify_severity(r)
        result.append({**r, "severity": severity})
    return result


if __name__ == "__main__":
    excursions = get_excursions()
    critical = [e for e in excursions if e["severity"] == "CRITICAL"]
    warnings  = [e for e in excursions if e["severity"] == "WARNING"]
    ok        = [e for e in excursions if e["severity"] == "OK"]
    assert len(critical) >= 1, "Expected at least 1 CRITICAL excursion in test data"
    assert len(ok) >= 1, "Expected at least 1 OK reading in test data"
    print(f"✓ cold_chain.py OK — {len(critical)} CRITICAL, {len(warnings)} WARNING, {len(ok)} OK")
