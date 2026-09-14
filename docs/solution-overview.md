# Solution Overview

**SupplyFlow AI** is an executive-grade operational telemetry and autonomous supply chain dispatch environment designed for instantaneous triage and proactive resolution of global logistics disruptions.

## What We Built

A **React 18 + FastAPI** web platform featuring the **Liquid Obsidian** dark glass aesthetic, JWT security, and interactive command modules:

1. **Autonomous Disruption Engine:**
   - Ingests active container corridors and correlates disrupted geographic nodes (dock strikes, landslides, tropical storms).
   - Generates 1-Click AI reroute approval with verified cost/time avoidance analytics.
   - Pushes turn-by-turn bypass telemetry directly to driver terminals.

2. **Fleet Capacity Re-Balancing:**
   - Real-time visibility into continental assets (trucks, containers, maritime vessels).
   - Multi-select bulk redeployment and one-click auto-dispatch to immediately allocate idle tonnage to congested hubs.
   - Route assignment console and live GPS telematics modal with battery and ground velocity metrics.

3. **Cold Chain Biosensor Monitor:**
   - Continuous IoT temperature streaming against pharmaceutical and perishable regulatory envelopes.
   - Classifies excursions by regulatory severity (WARNING for <2h, CRITICAL for ≥2h).
   - Dynamic SVG thermal trajectory wave with calibrated safe bands.
   - Active Intervention trigger: instantly activates emergency auxiliary refrigeration to recover cargo temperature.
   - Regulatory compliance logs exportable under FDA 21 CFR Part 11 / EU GDP validation.

4. **Executive Operational Instrumentation:**
   - Top executive header with live UTC clock, search-as-you-type, timeframes, and global mesh sync.
   - Specular glass KPI cards with trend sparklines and ambient optical glows.
   - Responsive multi-filter tables with instant client-side search and column sorting.

## Security

Authentication is strictly enforced via **JWT (JSON Web Tokens)**:
- Passwords hashed with `bcrypt` (Passlib).
- Signed tokens with Bearer Authorization header interceptors.
- Automatic session invalidation on 401 status.
