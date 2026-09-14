from fastapi import APIRouter
from engine.cold_chain import get_excursions

router = APIRouter(prefix="/api/cold-chain", tags=["cold-chain"])


@router.get("/alerts")
def cold_chain_alerts():
    return get_excursions()
