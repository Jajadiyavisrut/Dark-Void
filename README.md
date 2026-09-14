# 🚀 SupplyFlow AI — Supply Chain Disruption Assistant & Fleet Utilisation Optimizer

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | Daredevils |
| **Track** | AI |
| **Team Lead** | Yug Bhatt |
| **Members** | Visrut Jajadiya, Maharsh Solanki, Milan Vadhel |

---

## 🎯 Problem Statement

Supply chain disruptions — port strikes, bad weather, geopolitical events — cascade across hundreds of active shipments in ways impossible to track manually. Fleet assets sit idle while other routes are overloaded. Cold chain shipments are especially vulnerable: a single temperature excursion can spoil a $500K+ cargo, discovered only at delivery when it is already too late.

---

## 💡 Solution

**SupplyFlow AI** is a React + FastAPI dashboard that instantly identifies which shipments are affected by an active disruption, recommends reroutes and alternative carriers, surfaces idle fleet assets for redeployment, and monitors cold chain IoT sensor logs to classify temperature excursions by regulatory severity — all before delivery.

---

## ✨ Key Features

- **JWT Authentication:** Secure login with bcrypt password hashing and signed tokens — all API routes protected
- **Disruption Detection:** Maps active disruptions to affected shipments by route node matching
- **Reroute Recommendations:** Suggests alternative routes with estimated delay deltas
- **Fleet Utilisation:** Highlights idle assets and matches them to disrupted shipments
- **Cold Chain Monitoring:** Classifies temperature breaches as WARNING or CRITICAL using the regulatory 2-hour threshold
- **AI Recommendation Engine:** Assembles plain-language action summaries — no LLM or API key required

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.10+, JavaScript (JSX) |
| **Frameworks** | FastAPI, React 18, Vite |
| **Auth** | JWT (`python-jose`), bcrypt (`passlib`) |
| **IBM Technologies** | IBM Bob (hackathon submission context) |
| **Data** | Mock JSON fixtures (self-contained, no DB) |
| **Other** | python-dotenv, React Router, Axios |

---

## 📁 Repository Structure

```
src/
├── backend/
│   ├── main.py              # FastAPI app entry
│   ├── routers/             # API route handlers
│   ├── engine/              # Disruption, fleet, cold chain, recommendation logic
│   ├── data/                # Mock JSON fixtures
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/client.js    # Axios API client
    │   ├── components/      # Navbar, KPICard, AlertBadge
    │   ├── pages/           # Dashboard, Disruptions, Fleet, ColdChain
    │   └── styles/index.css # Dark theme design system
    ├── vite.config.js
    └── package.json
docs/
├── problem-statement.md
├── solution-overview.md
├── architecture.md
└── setup-guide.md
```

---

## 🚀 How to Run

```bash
# Backend
cd src/backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload     # runs on :8000

# Frontend (new terminal)
cd src/frontend
npm install
npm run dev                   # runs on :5173
```

---

## 🎥 Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

- Uses mock JSON data — not connected to a live database or real IoT feeds
- Reroute logic is a hardcoded lookup table (ponytail: O(1) map, upgrade to graph traversal for real route networks)
- No authentication — not production-ready

---

## 🏆 What We're Most Proud Of

The recommendation engine delivers actionable, context-aware supply chain triage in plain language without any LLM or external API — pure deterministic Python logic from three focused engine modules.
