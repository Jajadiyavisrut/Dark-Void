# Solution Overview

**SupplyFlow AI** is a lightweight, high-visibility dashboard and conversational agent designed to triage supply chain disruptions instantly.

## The Core Mechanism
Instead of building a monolithic enterprise application, we built a highly focused **Streamlit dashboard** backed by a **Python MCP (Model Context Protocol) Server**. 

1. **Disruption Engine:** Ingests active shipment routes and compares them against live disruption events (weather, port closures).
2. **Asset Matcher:** Scans the fleet database to find idle assets near disrupted shipments for rapid redeployment.
3. **IoT Monitor:** Continuously evaluates incoming cold chain sensor logs against regulatory thresholds, flagging excursions immediately.

## IBM Bob Integration
To make the system truly actionable, we exposed our core logic as a Python MCP Server. This allows **IBM Bob** to query the live supply chain state conversationally. Users can ask Bob, "Which shipments are affected by the port strike, and what idle trucks are nearby?" and receive immediate, context-aware answers.

## Why This Approach?
We chose a "lazy", efficient architecture. Rather than building custom UI for every edge case, the Streamlit dashboard provides the at-a-glance health of the network, while the IBM Bob MCP integration handles complex, ad-hoc natural language queries.
