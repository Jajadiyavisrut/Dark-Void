#!/usr/bin/env python3
"""SupplyFlow AI - MCP (Model Context Protocol) Server for IBM Bob
Implements JSON-RPC 2.0 over standard I/O for conversational supply chain triage.
"""

import sys
import json
import logging
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).parent
sys.path.insert(0, str(BASE_DIR))

from engine.disruption import get_affected_shipments, get_reroute
from engine.fleet import get_idle_assets, match_to_shipment
from engine.cold_chain import get_excursions, classify_severity
from engine.recommendations import generate_recommendation

logging.basicConfig(level=logging.INFO, stream=sys.stderr, format="%(asctime)s [%(levelname)s] %(message)s")

TOOLS = [
    {
        "name": "identify_affected_shipments",
        "description": "Identifies which active shipments are affected by a given active disruption event (e.g. DIST-001, DIST-002, DIST-003).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "disruption_id": {
                    "type": "string",
                    "description": "The unique ID of the disruption incident (e.g. 'DIST-001')."
                }
            },
            "required": ["disruption_id"]
        }
    },
    {
        "name": "recommend_reroute",
        "description": "Calculates alternative transit corridors, bypass routes, or carrier options for a delayed or disrupted shipment.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "shipment_id": {
                    "type": "string",
                    "description": "The shipment identifier (e.g. 'SHP-1001')."
                }
            },
            "required": ["shipment_id"]
        }
    },
    {
        "name": "get_idle_fleet_assets",
        "description": "Retrieves all currently idle fleet assets (trucks, containers, vessels) across distribution nodes available for redeployment.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "asset_type": {
                    "type": "string",
                    "description": "Optional filter for asset type: 'truck', 'container', or 'vessel'."
                }
            }
        }
    },
    {
        "name": "match_fleet_to_shipment",
        "description": "Finds the nearest optimal idle fleet asset with matching capacity for a stranded or delayed shipment.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "shipment_id": {
                    "type": "string",
                    "description": "The shipment identifier to match idle fleet assets to."
                }
            },
            "required": ["shipment_id"]
        }
    },
    {
        "name": "monitor_cold_chain_excursions",
        "description": "Scans IoT sensor telemetry logs across all active shipments to detect temperature breaches and classify regulatory severity (FDA/EU GDP).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "severity_filter": {
                    "type": "string",
                    "enum": ["ALL", "CRITICAL", "WARNING", "OK"],
                    "description": "Filter excursions by severity level."
                }
            }
        }
    },
    {
        "name": "generate_shipment_triage_plan",
        "description": "Generates a complete rule-based remediation and triage plan synthesizing disruption rerouting, fleet matching, and cold-chain interventions.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "shipment_id": {
                    "type": "string",
                    "description": "The target shipment identifier to generate a triage plan for."
                }
            },
            "required": ["shipment_id"]
        }
    }
]


def execute_tool(name: str, args: dict) -> dict:
    if name == "identify_affected_shipments":
        disruption_id = args.get("disruption_id", "")
        affected = get_affected_shipments(disruption_id)
        return {
            "disruption_id": disruption_id,
            "affected_count": len(affected),
            "shipments": affected
        }

    elif name == "recommend_reroute":
        shipment_id = args.get("shipment_id", "")
        reroute = get_reroute(shipment_id)
        if not reroute:
            return {"shipment_id": shipment_id, "message": "No active reroute required or shipment route is clear."}
        return reroute

    elif name == "get_idle_fleet_assets":
        asset_type = args.get("asset_type")
        idle = get_idle_assets()
        if asset_type:
            idle = [a for a in idle if a.get("type", "").lower() == asset_type.lower()]
        total_capacity = sum(a.get("capacity_tonnes", 0) for a in idle)
        return {
            "idle_count": len(idle),
            "total_capacity_tonnes": total_capacity,
            "assets": idle
        }

    elif name == "match_fleet_to_shipment":
        shipment_id = args.get("shipment_id", "")
        matched = match_to_shipment(shipment_id)
        if not matched:
            return {"shipment_id": shipment_id, "matched": None, "message": "No suitable idle assets found."}
        return {
            "shipment_id": shipment_id,
            "matched_asset": matched,
            "redeployment_action": f"Deploy {matched['type']} {matched['id']} ({matched['capacity_tonnes']}T) from {matched['location']}."
        }

    elif name == "monitor_cold_chain_excursions":
        sev_filter = args.get("severity_filter", "ALL")
        excursions = get_excursions()
        if sev_filter and sev_filter != "ALL":
            excursions = [e for e in excursions if e.get("severity") == sev_filter]
        return {
            "total_monitored": len(excursions),
            "readings": excursions
        }

    elif name == "generate_shipment_triage_plan":
        shipment_id = args.get("shipment_id", "")
        return generate_recommendation(shipment_id)

    else:
        raise ValueError(f"Unknown tool: {name}")


def main():
    logging.info("Starting SupplyFlow AI MCP Server for IBM Bob...")
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            req_id = req.get("id")
            method = req.get("method")
            params = req.get("params", {})

            if method == "initialize":
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {
                            "tools": {}
                        },
                        "serverInfo": {
                            "name": "supplyflow-ai-mcp",
                            "version": "1.0.0"
                        }
                    }
                }
                sys.stdout.write(json.dumps(resp) + "\n")
                sys.stdout.flush()

            elif method == "notifications/initialized":
                # Client acknowledging initialization
                continue

            elif method == "tools/list":
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "tools": TOOLS
                    }
                }
                sys.stdout.write(json.dumps(resp) + "\n")
                sys.stdout.flush()

            elif method == "tools/call":
                tool_name = params.get("name")
                tool_args = params.get("arguments", {})
                try:
                    result_data = execute_tool(tool_name, tool_args)
                    resp = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": json.dumps(result_data, indent=2)
                                }
                            ]
                        }
                    }
                except Exception as err:
                    resp = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "isError": True,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": f"Error executing tool '{tool_name}': {str(err)}"
                                }
                            ]
                        }
                    }
                sys.stdout.write(json.dumps(resp) + "\n")
                sys.stdout.flush()

            else:
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32601,
                        "message": f"Method not found: {method}"
                    }
                }
                sys.stdout.write(json.dumps(resp) + "\n")
                sys.stdout.flush()

        except Exception as e:
            logging.error(f"Error handling request: {e}")
            err_resp = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {
                    "code": -32700,
                    "message": f"Parse error: {str(e)}"
                }
            }
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
