# SupplyFlow AI — Complete Repository Context & Architectural Blueprint

> **Repository:** `Dark-Void` / `SupplyFlow AI`  
> **Challenge Track:** L2 Supply Chain Disruption Assistant & Fleet Utilisation Optimizer (IBM Bob Track)  
> **Primary Stack:** React 18 + Vite (Liquid Obsidian Dark Glass UI) · Python FastAPI (REST Core) · Python MCP Server (IBM Bob JSON-RPC 2.0)  
> **Target Audience:** Future AI coding assistants, autonomous agents, and systems engineers collaborating on this codebase.

---

## 1. Project Mission & Problem Statement

### 1.1 The Ongoing Pain
Global supply chains suffer from severe fragility:
1. **Disruption Cascades:** Weather events (e.g. Cyclone Biparjoy), port strikes (e.g. Nhava Sheva Terminal strike), and highway bottlenecks cascade across hundreds of active in-transit shipments in ways that are impossible to calculate manually. Logistics teams respond reactively rather than proactively.
2. **Sub-optimal Fleet Utilisation:** While specific corridors face acute bottlenecks, high-value fleet assets (multi-axle freight trucks, refrigerated 40ft containers, feeder vessels) sit idle at secondary inland depots without visibility for rapid re-allocation.
3. **Cold Chain Vulnerability:** Cold-chain shipments (mRNA vaccines, oncology infusions, insulin cartridges, cryogenic blood plasma) are vulnerable to undetected micro-climatic breaches. A single temperature excursion across any leg can destroy $500K+ of bio-pharmaceutical cargo. Breaches are traditionally only discovered upon physical delivery when goods have already spoiled.

### 1.2 The Challenge
Build an intelligent, end-to-end solution (with IBM Bob conversational AI capabilities) that:
- **Identifies Affected Shipments:** Maps active disruption incidents to transit corridors and flags impacted freight in real-time.
- **Recommends Intelligent Re-routing:** Determines alternative transit paths, bypasses, or carrier alternatives with delay-delta and cost-avoidance calculations.
- **Optimizes Fleet Redeployment:** Detects idle assets, computes regional capacity surpluses, and executes auto-dispatch and corridor assignment.
- **Surveys Cold Chain IoT Telemetry:** Continuously evaluates thermal sensor logs, classifies regulatory severity under FDA 21 CFR Part 11 and EU GDP guidelines, and triggers auxiliary cooling interventions before delivery.

---

## 2. High-Level Architectural Topology

```
                  ┌──────────────────────────────────────────────┐
                  │                 IBM Bob AI                   │
                  │         (Conversational Assistant)           │
                  └──────────────────────┬───────────────────────┘
                                         │ JSON-RPC 2.0 (stdio)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │          SupplyFlow MCP Server               │
                  │        (src/backend/mcp_server.py)           │
                  └──────────────┬───────────────────────────────┘
                                 │
                                 │ Direct Python Engine Invocations
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Backend Decision Engines & Storage                   │
│                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────┐ │
│  │   Disruption Engine  │  │    Fleet Optimizer   │  │  Cold Chain   │ │
│  │(disruption.py/rec.py)│  │      (fleet.py)      │  │(cold_chain.py)│ │
│  └──────────┬───────────┘  └──────────┬───────────┘  └───────┬───────┘ │
│             │                         │                      │         │
│  ┌──────────▼─────────────────────────▼──────────────────────▼───────┐ │
│  │               FastAPI REST API Layer (Port 8000)                  │ │
│  │         Routers: shipments, disruptions, fleet, cold_chain        │ │
│  └────────────────────────────────────┬──────────────────────────────┘ │
│                                       │                                │
│  ┌────────────────────────────────────▼──────────────────────────────┐ │
│  │        JSON Datastores (src/backend/data/*.json)                  │ │
│  │        disruptions.json · shipments.json · fleet.json · sensors   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────▲────────────────────────────────┘
                                        │ HTTP REST + Bearer JWT
                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│            Frontend Command Cockpit (Vite / React 18 / Port 5173)      │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                   Liquid Obsidian Design System                   │ │
│  │    Dark Glassmorphism · Specular Highlights · JetBrains Mono UI   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐ │
│  │   Dashboard   │ │  Disruptions  │ │Fleet/Capacity│ │ Cold Chain  │ │
│  │  (Exec KPIs)  │ │(Reroute Desk) │ │  (Redeploy)   │ │ (IoT Specs) │ │
│  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Directory Layout & File Manifest

```
d:\Projects\Dark-Void\
├── CONTEXT.md                    # THIS FILE: Master context file for AI assistants
├── README.md                     # High-level README documentation
├── submission.yaml               # IBM Bob challenge submission metadata
├── docs/                         # Architecture, PRD, and design specifications
│   ├── ARCHITECTURE.md           # System design & data flow
│   ├── DESIGN.md                 # Liquid Obsidian visual design system tokens
│   ├── PRD.md                    # Product requirements document
│   └── SOLUTION_OVERVIEW.md      # Solution pitch and technical highlights
├── presentation/                 # Presentation assets and slides
├── src/
│   ├── backend/
│   │   ├── main.py               # FastAPI entrypoint, CORS configuration, router mounting
│   │   ├── auth.py               # JWT authentication, token hashing, user auth middleware
│   │   ├── mcp_server.py         # Standard I/O JSON-RPC 2.0 Model Context Protocol server for IBM Bob
│   │   ├── requirements.txt      # Python runtime dependencies
│   │   ├── data/                 # JSON file datastores
│   │   │   ├── disruptions.json  # Disruption incidents & impacted corridors
│   │   │   ├── shipments.json    # In-transit shipments & routes
│   │   │   ├── fleet.json        # Trucks, containers, vessels, coordinates, telematics
│   │   │   └── sensors.json      # IoT thermal readings, breach history, battery telemetry
│   │   ├── engine/               # Algorithmic decision logic
│   │   │   ├── disruption.py     # Disruption impact scanner & detour generator
│   │   │   ├── fleet.py          # Idle asset allocator & shipment matcher
│   │   │   ├── cold_chain.py     # Thermal excursion severity classifier
│   │   │   └── recommendations.py# Multi-engine triage assembler
│   │   └── routers/              # REST API route handlers
│   │       ├── auth.py           # /api/auth/login and user sessions
│   │       ├── shipments.py      # /api/shipments and carrier SLA analytics
│   │       ├── disruptions.py    # /api/disruptions, reroute approvals, driver dispatch
│   │       ├── fleet.py          # /api/fleet, auto-dispatch, route assignment, live GPS
│   │       └── cold_chain.py     # /api/cold-chain, emergency cooling, compliance logs
│   └── frontend/
│       ├── index.html            # Vite HTML host
│       ├── vite.config.js        # Vite build & proxy settings
│       ├── package.json          # React 18, Lucide React, dependencies
│       └── src/
│           ├── main.jsx          # React DOM root mounting
│           ├── App.jsx           # Routing switch & authenticated layout wrapper
│           ├── api/
│           │   └── client.js     # Axios API client, auth headers, error handling
│           ├── styles/
│           │   └── index.css     # Complete Liquid Obsidian CSS Design System
│           ├── components/
│           │   ├── TopHeader.jsx # Global status ribbon, UTC clock, live heartbeat
│           │   ├── Navbar.jsx    # Glass navigation sidebar
│           │   └── AlertBadge.jsx# Status badge component (OK, Warning, Critical)
│           └── pages/
│               ├── Login.jsx       # Glassmorphic operator login console
│               ├── Dashboard.jsx   # Multi-KPI overview & rapid triage drawer
│               ├── Disruptions.jsx # Tactical rerouting desk & live detour preview
│               ├── Fleet.jsx       # Autonomous dispatch & GPS telematics tracker
│               └── ColdChain.jsx   # IoT thermal surveillance & emergency refrigeration
```

---

## 4. Entity Schemas & Dynamic Data Models

All entities are dynamically sourced from `src/backend/data/*.json`. Hardcoding IDs or static lists in frontend or backend logic is strictly forbidden.

### 4.1 Disruptions (`disruptions.json`)
```json
{
  "id": "DIST-001",
  "title": "Port Strike — Nhava Sheva (JNPT)",
  "affected_node": "PORT-A",
  "active": true,
  "severity": "CRITICAL",
  "description": "Indefinite strike at JNPT terminal causing 72h+ vessel berth congestion.",
  "est_clearance": "72 Hours",
  "direct_impact": "Vessel Berth & Container Gate Lockdown",
  "coordinates": "18.9499° N, 72.9512° E",
  "alternative_node": "PORT-B (Mumbai Old Port) / Hazira",
  "impacted_units": "7 Freight Units",
  "recommendation_summary": "Divert via Hazira Coastal Terminal or Port B (Mumbai). Avoid Western Highway entry.",
  "cost_avoidance_usd": 12400,
  "confidence_score": 96.4,
  "action_type": "reroute",
  "action_label": "Authorize AI Detour"
}
```

### 4.2 Shipments (`shipments.json`)
```json
{
  "id": "SHP-1001",
  "origin": "Ahmedabad",
  "destination": "Mumbai Port",
  "route": ["Ahmedabad", "PORT-A", "Mumbai"],
  "carrier": "Carrier A",
  "status": "delayed",
  "cold_chain": true,
  "estimated_delay_hours": 8
}
```

### 4.3 Fleet (`fleet.json`)
```json
{
  "id": "TRK-401",
  "type": "truck",
  "capacity_tonnes": 25,
  "location": "Ahmedabad",
  "status": "idle",
  "lat": 23.0225,
  "lng": 72.5714,
  "speed_kmh": 0,
  "driver": "Rajesh Sharma",
  "battery_pct": 98,
  "destination": "Ahmedabad Logistics Hub",
  "assigned_route": "Regional Standby"
}
```

### 4.4 Cold Chain Sensors (`sensors.json`)
```json
{
  "shipment_id": "SHP-1001",
  "cargo_type": "Pharma Vaccines (mRNA)",
  "required_min_c": 2.0,
  "required_max_c": 8.0,
  "current_temp_c": 11.3,
  "breach_duration_hours": 2.5,
  "battery_pct": 94,
  "sensor_protocol": "Cryo-Air Dual",
  "temperature_curve": [3.2, 4.0, 5.5, 7.8, 9.6, 11.3]
}
```

---

## 5. Decision Engines

Located in `src/backend/engine/`:

### 5.1 Disruption Engine (`disruption.py`)
- `get_affected_shipments(disruption_id: str) -> list[dict]`:
  Identifies active shipments whose scheduled route includes the disrupted `affected_node`.
- `get_reroute(shipment_id: str) -> dict | None`:
  Determines deterministic alternate bypass routes (`_REROUTES`) calculating delay deltas.

### 5.2 Fleet Optimizer (`fleet.py`)
- `get_idle_assets() -> list[dict]`:
  Filters assets with `status == "idle"`.
- `match_to_shipment(shipment_id: str) -> dict | None`:
  Matches idle assets with matching cargo capacity starting from shipment origin.

### 5.3 Cold Chain Excursion Classifier (`cold_chain.py`)
- `classify_severity(reading: dict) -> str`:
  - `OK`: Temperature is strictly within `required_min_c` and `required_max_c`.
  - `WARNING`: Temperature is breached, but `breach_duration_hours < 2`.
  - `CRITICAL`: Temperature is breached AND `breach_duration_hours >= 2.0` (mandating immediate corrective reroute or refrigeration).

### 5.4 Unified Recommendations (`recommendations.py`)
- `generate_recommendation(shipment_id: str) -> dict`:
  Synthesizes disruption rerouting, fleet matching, and cold chain alerts into an actionable triage summary.

---

## 6. Complete REST API Reference

All protected endpoints require `Authorization: Bearer <token>`. Default demo credentials: `username: admin`, `password: admin123`.

### 6.1 Authentication
- `POST /api/auth/login`: Accepts `username` and `password`. Returns `{ access_token, token_type }`.
- `GET /api/auth/me`: Validates JWT token and returns current operator profile.

### 6.2 Disruptions
- `GET /api/disruptions`: Lists all disruption incidents.
- `GET /api/disruptions/{id}/affected`: Returns affected shipments and pre-computed reroute vectors.
- `POST /api/disruptions/{id}/approve-reroute`: Applies reroute, updates shipment destinations and status, returns cost avoidance.
- `POST /api/disruptions/{id}/dispatch-drivers`: Dispatches turn-by-turn bypass telemetry to drivers.
- `POST /api/disruptions/{id}/archive`: Clears or archives resolved incidents.

### 6.3 Fleet & Capacity
- `GET /api/fleet`: Returns all fleet assets and telematics.
- `GET /api/fleet/idle`: Returns idle fleet assets only.
- `POST /api/fleet/redeploy`: Batch redeploys selected asset IDs to target hub.
- `POST /api/fleet/auto-dispatch`: Automatically balances idle capacity across critical nodes.
- `POST /api/fleet/{id}/assign`: Assigns a specific asset to a corridor and destination.
- `GET /api/fleet/{id}/gps`: Returns live simulated GPS telematics (speed, lat/lng, battery, operator).

### 6.4 Cold Chain Surveillance
- `GET /api/cold-chain/alerts`: Returns live sensor readings tagged with classified severity (`OK`, `WARNING`, `CRITICAL`).
- `POST /api/cold-chain/{id}/refrigerate`: Triggers emergency auxiliary chilling, resets breach duration, normalizes cargo temperature.
- `GET /api/cold-chain/compliance-logs`: Generates FDA 21 CFR Part 11 / EU GDP compliant audit logs for download.

### 6.5 Shipments & Analytics
- `GET /api/shipments`: Lists all shipments.
- `GET /api/shipments/{id}`: Returns details and recommendation for a shipment.
- `GET /api/shipments/analytics`: Dynamically calculates carrier on-time percentages, network SLA, and delay distributions.
- `POST /api/shipments/{id}/apply-reroute`: Applies individual reroute.

---

## 7. Model Context Protocol (MCP) Server for IBM Bob

The server `src/backend/mcp_server.py` implements the standard JSON-RPC 2.0 protocol over `stdin`/`stdout`.

### 7.1 Running the MCP Server
```powershell
python src/backend/mcp_server.py
```

### 7.2 Tools Available to IBM Bob:
1. `identify_affected_shipments`: Takes `disruption_id` (e.g. `DIST-001`), returns affected shipments.
2. `recommend_reroute`: Takes `shipment_id`, returns detour corridor and extra delay hours.
3. `get_idle_fleet_assets`: Takes optional `asset_type`, returns idle units and available tonnage.
4. `match_fleet_to_shipment`: Takes `shipment_id`, finds nearest available idle truck/container.
5. `monitor_cold_chain_excursions`: Takes optional `severity_filter`, returns active breaches.
6. `generate_shipment_triage_plan`: Synthesizes disruption, fleet, and thermal recommendations into an executive remediation summary.

---

## 8. Frontend Design System: Liquid Obsidian

The UI is built under the **Liquid Obsidian (Apple Dark Glass)** design system defined in `src/frontend/src/styles/index.css` and `docs/DESIGN.md`:

- **Design Philosophy:** Anti-slop, high density, dark obsidian glass, specular borders, micro-animations.
- **Palette:**
  - Base Obsidian: `--bg: #08090C`, `--surface: #0E1118`, `--surface-2: #141824`
  - Specular Borders: `--border-glass: 1px solid rgba(255,255,255,0.08)`
  - Accents: Electric Cyan (`#38bdf8`), Cyber Emerald (`#10b981`), Radiant Amber (`#f59e0b`), Rose Crimson (`#f43f5e`)
- **Typography:**
  - Headings & Body: `Inter`, sans-serif
  - Identifiers, Timers, Telematics: `JetBrains Mono`, monospace
- **Icons:** Modern SVG icons via `lucide-react`. Raw text emojis are banned across all production views.

---

## 9. Dynamic Coding Principles & Anti-Hardcoding Guarantees

1. **No Static IDs:** UI components must never use conditionals like `if (item.id === 'DIST-001')`. All attributes (`direct_impact`, `action_label`, `cargo_type`, etc.) must be read directly from the backend model.
2. **Derived Metrics:** Counts such as `idleTonnage`, `activeLoadPct`, `truckCount`, and `criticalAlerts` must be computed dynamically using array methods (`reduce`, `filter`, `map`) from live state.
3. **No Mocks in Production Pages:** All user actions (e.g. *Authorize Reroute*, *Deploy Asset*, *Trigger Cooling*) trigger real FastAPI backend endpoints that mutate backend state.

---

## 10. How to Run, Test, and Build

### 10.1 Backend (FastAPI)
```powershell
cd src/backend
.venv\Scripts\activate
uvicorn main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/api/health`

### 10.2 Frontend (React 18 + Vite)
```powershell
cd src/frontend
npm install
npm run dev
```
- Local URL: `http://localhost:5173`
- Production Build Verification:
```powershell
npm run build
```
*(Build artifact generated in `src/frontend/dist/` in ~2-5 seconds).*

### 10.3 MCP Server (For IBM Bob Testing)
```powershell
python -c "import sys; sys.path.insert(0, 'src/backend'); from mcp_server import execute_tool; print(execute_tool('identify_affected_shipments', {'disruption_id': 'DIST-001'}))"
```
