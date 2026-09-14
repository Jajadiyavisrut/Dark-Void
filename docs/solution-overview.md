# Solution Overview

**SupplyFlow AI** is a lightweight, high-visibility dashboard designed to triage supply chain disruptions instantly.

## What We Built

A **React + FastAPI** web application with JWT authentication and four core supply chain modules:

1. **Disruption Engine:** Ingests active shipment routes and identifies which shipments pass through a disrupted node (port, road, region). Returns a reroute recommendation from a curated alternatives table.
2. **Asset Matcher:** Scans the fleet data to find idle assets near disrupted shipments for immediate redeployment.
3. **Cold Chain Monitor:** Evaluates IoT sensor readings against regulatory thresholds. Classifies breaches as WARNING (<2h) or CRITICAL (≥2h) using the standard 2-hour regulatory rule.
4. **Recommendation Engine:** Assembles a plain-language action summary from the above three modules — no LLM required.

## Security

Authentication is handled via **JWT (JSON Web Tokens)**:
- Passwords are hashed with `bcrypt` before storage
- Login returns a signed JWT valid for 60 minutes
- All supply chain endpoints are protected — requests without a valid Bearer token receive a `401 Unauthorized` response
- The React frontend automatically attaches the token to every API call and redirects to the login page on expiry

## Why This Approach?

Rather than building a monolithic enterprise app, we built a focused, minimal system. The FastAPI backend handles logic and auth; the React dashboard handles display. All data is driven from realistic mock JSON fixtures, making the demo fully self-contained without any external dependencies.
