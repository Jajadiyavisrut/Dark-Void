# 🚀 SupplyFlow AI: Supply Chain Disruption Assistant & Fleet Utilisation Optimizer

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | Daredevils |
| **Track** | AI |
| **Team Lead** | Yug Bhatt — yug@example.com |
| **Members** | Visrut Jajadiya, Maharsh Solanki, Milan Vadhel |

---

## 🎯 Problem Statement

Supply chain disruptions like port strikes cascade across shipments, causing fleet assets to idle. Simultaneously, cold chain shipments lack real-time temperature monitoring, leading to undetected spoilage before delivery.

---

## 💡 Solution

**SupplyFlow AI** is a Streamlit dashboard and Python MCP server that correlates active disruptions with shipments, identifies idle fleet assets, and monitors cold chain IoT logs. It integrates with IBM Bob to conversationalize supply chain triage.

---

## ✨ Key Features

- **Disruption Detection & Impact Analysis:** Handles events such as port closures and automatically identifies affected shipments.
- **Route & Carrier Recommendation:** Suggests alternative routes and available carriers if current ones are affected.
- **Fleet Utilisation:** Identifies idle vehicles or other assets and suggests redeployment opportunities.
- **Cold Chain Monitoring:** Analyzes sensor data to detect temperature excursions before delivery.
- **AI Recommendation & Chat Assistant:** Provides prioritized action plans using IBM Bob via a custom MCP Server.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python |
| **Frameworks** | Streamlit |
| **IBM Technologies** | IBM Bob, MCP (Model Context Protocol), watsonx.ai |
| **Databases** | Local JSON (Mock Data) |
| **Other** | python-dotenv |

---

## 📁 Repository Structure

```
├── src/                  # All source code (Streamlit + MCP server)
├── docs/                 # Written documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   ├── setup-guide.md
├── demo/                 # Demo artifacts
│   ├── screenshots/      # App screenshots
│   ├── demo-video-link.txt  # Link to demo video
├── presentation/         # Slide deck
├── submission.yaml       # Structured submission metadata
```

---

## 🚀 How to Run

> **Copy these exact steps from your [`docs/setup-guide.md`](docs/setup-guide.md)**

```bash
# 1. Clone the repo
git clone https://github.com/Jajadiyavisrut/Dark-Void.git
cd Dark-Void

# 2. Install dependencies
python -m venv .venv
.venv\Scripts\activate
pip install -r src/requirements.txt

# 3. Configure environment
cp src/.env.example src/.env
# Edit src/.env with your values

# 4. Run the project
cd src
streamlit run app.py
```

---

## 🎥 Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | NOT DEPLOYED |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/slides.pdf](presentation/) |

---

## ⚠️ Known Limitations

> Be honest - judges appreciate transparency over overclaiming.

- Authentication is mocked - not production-ready.
- Uses mock JSON data instead of a live database.
- Reroute logic is a naive heuristic (ponytail: O(n) hardcoded routes) rather than a full Dijkstra/A* graph traversal.

---

## 🏆 What We're Most Proud Of

The seamless integration of our core Python logic with IBM Bob via an MCP Server, allowing natural language queries directly against live supply chain state without building a complex conversational UI from scratch.
