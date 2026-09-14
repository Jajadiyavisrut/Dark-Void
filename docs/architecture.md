# Architecture

Our architecture is minimal — Python backend, React frontend, no database.

## Component Breakdown

| Component | Technology | Responsibility |
|---|---|---|
| **Dashboard** | React 18 + Vite (JSX) | Visual overview of shipments, disruptions, fleet, cold chain |
| **API** | FastAPI (Python) | Serves JSON data, runs engine logic, handles CORS |
| **Engine** | Pure Python modules | Disruption detection, fleet matching, cold chain severity |
| **Data** | Mock JSON files | Realistic supply chain fixtures — no DB required |
| **Config** | `python-dotenv` | Manages environment variables safely |

## Data Flow

```mermaid
graph TD
    A[Mock JSON Data] -->|Read on request| B[FastAPI Routers]
    B -->|Calls| C[Engine Modules]
    C --> C1[disruption.py]
    C --> C2[fleet.py]
    C --> C3[cold_chain.py]
    C --> C4[recommendations.py]
    B -->|JSON response| D[React Frontend]
    E[User] -->|Browser| D
    D -->|HTTP GET /api/*| B
```

## Port Mapping

| Service | Port |
|---|---|
| FastAPI backend | `8000` |
| React frontend (Vite dev) | `5173` |
