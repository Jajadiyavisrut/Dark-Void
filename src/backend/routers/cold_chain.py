from fastapi import APIRouter, Depends
from auth import get_current_user
from engine.cold_chain import get_excursions

router = APIRouter(prefix="/api/cold-chain", tags=["cold-chain"])


@router.get("/alerts")
def cold_chain_alerts(user: str = Depends(get_current_user)):
    return get_excursions()
