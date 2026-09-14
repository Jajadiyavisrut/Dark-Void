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
   > Edit `.env` and set a strong `JWT_SECRET` before deploying to production.

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

## Authentication

The app uses **JWT (JSON Web Token)** authentication.

| Endpoint | Method | Body | Description |
|---|---|---|---|
| `/api/auth/register` | POST | `{username, password}` | Create a new account |
| `/api/auth/login` | POST | `{username, password}` | Returns `access_token` |

**Demo credentials (pre-seeded):**
```
username: demo
password: demo123
```

All other API endpoints require a valid Bearer token in the `Authorization` header.  
The React app handles this automatically — the login form stores the token in `localStorage` and every API call includes it.

## Verification
- Open `http://localhost:5173` — you will be redirected to the login page
- Sign in with `demo / demo123` — dashboard loads with live data
- Open `http://localhost:8000/docs` — interactive Swagger UI with auth support
- All 4 pages (Dashboard, Disruptions, Fleet, Cold Chain) require authentication
