# Setup Guide

## Prerequisites
- Python 3.10+
- IBM Bob CLI installed

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jajadiyavisrut/Dark-Void.git
   cd Dark-Void
   ```

2. **Set up the virtual environment**
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # Mac/Linux
   source .venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r src/requirements.txt
   ```

4. **Configure Environment**
   ```bash
   cp src/.env.example src/.env
   # Edit src/.env and add your API keys
   ```

## Running the Application

**Run the Streamlit Dashboard:**
```bash
cd src
streamlit run app.py
```

**Run the IBM Bob MCP Server:**
```bash
cd src
python mcp_server.py
```

## Verification
- The Streamlit dashboard should be accessible at `http://localhost:8501`.
- You can test the MCP server by running IBM Bob and asking it to check the supply chain status.
