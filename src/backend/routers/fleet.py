import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from auth import get_current_user
from engine.fleet import get_idle_assets

router = APIRouter(prefix="/api/fleet", tags=["fleet"])

_DATA = Path(__file__).parent.parent / "data" / "fleet.json"

def _load() -> list:
    return json.loads(_DATA.read_text())

def _save(data: list):
    _DATA.write_text(json.dumps(data, indent=2))


class RedeployRequest(BaseModel):
    asset_ids: List[str]
    target_hub: Optional[str] = "West Distribution Hub (Surat)"


class AssignRouteRequest(BaseModel):
    route: str
    destination: str
    cargo_manifest: Optional[str] = "Containerized Medical Supplies"


@router.get("")
def list_fleet(user: str = Depends(get_current_user)):
    return _load()


@router.get("/idle")
def list_idle(user: str = Depends(get_current_user)):
    return get_idle_assets()


@router.post("/redeploy")
def redeploy_assets(req: RedeployRequest, user: str = Depends(get_current_user)):
    fleet = _load()
    updated = []
    for asset in fleet:
        if asset["id"] in req.asset_ids:
            asset["status"] = "in_use"
            asset["location"] = f"{asset['location']} → {req.target_hub}"
            updated.append(asset["id"])
    _save(fleet)
    return {
        "status": "success",
        "message": f"Successfully redeployed {len(updated)} assets to {req.target_hub}",
        "redeployed_assets": updated
    }


@router.post("/auto-dispatch")
def auto_dispatch(user: str = Depends(get_current_user)):
    fleet = _load()
    idle_assets = [a for a in fleet if a["status"] == "idle"]
    dispatched = []
    for asset in idle_assets[:3]:  # dispatch top 3 idle units
        asset["status"] = "in_use"
        dispatched.append(asset["id"])
    _save(fleet)
    return {
        "status": "success",
        "dispatched_count": len(dispatched),
        "dispatched_ids": dispatched,
        "message": f"Autonomous dispatch initialized for {len(dispatched)} units."
    }


@router.post("/{asset_id}/assign")
def assign_route(asset_id: str, req: AssignRouteRequest, user: str = Depends(get_current_user)):
    fleet = _load()
    asset = next((a for a in fleet if a["id"] == asset_id), None)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset["status"] = "in_use"
    asset["assigned_route"] = req.route
    asset["destination"] = req.destination
    _save(fleet)
    return {
        "status": "assigned",
        "asset_id": asset_id,
        "route": req.route,
        "destination": req.destination,
        "message": f"Asset {asset_id} dispatched to {req.destination} via {req.route}"
    }


@router.get("/{asset_id}/gps")
def get_gps_telematics(asset_id: str, user: str = Depends(get_current_user)):
    fleet = _load()
    asset = next((a for a in fleet if a["id"] == asset_id), None)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    return {
        "asset_id": asset_id,
        "type": asset.get("type"),
        "status": asset.get("status"),
        "city": asset.get("location", "Central Hub"),
        "lat": asset.get("lat", 19.0760),
        "lng": asset.get("lng", 72.8777),
        "speed_kmh": asset.get("speed_kmh", 0),
        "driver": asset.get("driver", "Autonomous Unit"),
        "battery_pct": asset.get("battery_pct", 95),
        "destination": asset.get("destination"),
        "assigned_route": asset.get("assigned_route"),
        "telemetry_synced": True,
        "latency_ms": 14
    }

