# Setup Guide

## Prerequisites
- Python 3.10+
- Node.js 18+

## Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jajadiyavisrut/Dark-Void.git
   cd Dark-Void
   ```

2. **Create virtual environment and install dependencies**
   ```bash
   cd src/backend
   python -m venv .venv

   # Windows
   .venv\Scripts\activate
   # Mac/Linux
   source .venv/bin/activate

   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   # Windows
   copy .env.example .env
   # Mac/Linux
   cp .env.example .env
   ```

4. **Run the API server**
   ```bash
   uvicorn main:app --reload
   ```
   API will be available at `http://localhost:8000`

## Frontend Setup

1. **Install dependencies**
   ```bash
   cd src/frontend
   npm install
   ```

2. **Run the dev server**
   ```bash
   npm run dev
   ```
   Dashboard will be available at `http://localhost:5173`

## Verification
- Open `http://localhost:5173` — dashboard loads with live data from the API
- Open `http://localhost:8000/docs` — FastAPI auto-generated Swagger UI
- All 4 pages (Dashboard, Disruptions, Fleet, Cold Chain) should show data
