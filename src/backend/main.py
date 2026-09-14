import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import shipments, disruptions, fleet, cold_chain, auth

load_dotenv()

app = FastAPI(title="SupplyFlow AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(shipments.router)
app.include_router(disruptions.router)
app.include_router(fleet.router)
app.include_router(cold_chain.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
