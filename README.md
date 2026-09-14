# L2 --- Supply Chain Disruption Assistant & Fleet Utilisation Optimizer

## 1. Problem Statement

Supply chain problems such as bad weather, port strikes, and
geopolitical events can affect many shipments at the same time.

At the same time, some trucks, containers, or other fleet assets may be
sitting unused while other routes are overloaded.

Cold-chain shipments are especially important because a temperature
problem can damage sensitive goods.

The official L2 challenge asks us to identify affected shipments,
suggest rerouting or alternative carriers, find idle fleet assets, and
detect cold-chain temperature problems. fileciteturn0file0L134-L147

------------------------------------------------------------------------

# 2. Our Solution

## SupplyFlow AI

**SupplyFlow AI** is an AI-powered supply-chain assistant that helps
companies quickly understand disruptions and decide what to do next.

### Simple Flow

``` text
Shipments + Fleet + Routes + Sensor Data
                  ↓
             SupplyFlow AI
                  ↓
        Detect the problem
                  ↓
       Find affected shipments
                  ↓
        Find available assets
                  ↓
        Suggest better routes
                  ↓
      Check cold-chain problems
                  ↓
          AI Recommendation
```

------------------------------------------------------------------------

# 3. Main Features

## Feature 1 --- Shipment Tracking

Show all active shipments.

For each shipment:

-   Shipment ID
-   Current location
-   Destination
-   Current route
-   Status
-   Estimated delay

Example:

``` text
Shipment #1024

From: Ahmedabad
To: Mumbai Port

Status: ⚠ Delayed
Delay: 8 hours
```

------------------------------------------------------------------------

# 4. Feature 2 --- Detect Supply Chain Disruptions

The system should handle events such as:

-   Port closure
-   Bad weather
-   Road blockage
-   Strike
-   Geopolitical disruption

Example:

``` text
🚨 PORT DISRUPTION

Port A is unavailable.

Affected shipments: 37
```

------------------------------------------------------------------------

# 5. Feature 3 --- Find Affected Shipments

When a disruption occurs, automatically identify shipments that may be
affected.

Example:

``` text
Port A closed
     ↓
37 shipments affected
     ↓
21 likely delayed
     ↓
4 cold-chain shipments
```

This saves the team from checking every shipment manually.

------------------------------------------------------------------------

# 6. Feature 4 --- Route Recommendation

If the current route is affected, suggest another route.

Example:

``` text
Current Route:
Port A ❌

Recommended:
Port B → Warehouse C

Estimated delay:
2 hours instead of 18 hours
```

Show the reason for the recommendation.

------------------------------------------------------------------------

# 7. Feature 5 --- Alternative Carrier

If the current carrier is unavailable, suggest another available
carrier.

Example:

``` text
Current Carrier: Carrier A
Status: ❌ Unavailable

Alternative:
Carrier B

Available capacity:
12 shipments
```

------------------------------------------------------------------------

# 8. Feature 6 --- Fleet Utilisation

Find vehicles or other assets that are not being used.

Example:

``` text
Idle Assets

Truck #12 → Idle
Truck #27 → Idle
Container #81 → Idle
```

The system can suggest where these assets could be used.

------------------------------------------------------------------------

# 9. Feature 7 --- Cold Chain Monitoring

Some shipments need controlled temperatures.

The system should check sensor data.

Example:

``` text
Shipment #500

Required: 2°C – 8°C

Current: 11°C

🚨 TEMPERATURE EXCURSION
```

The system should identify the problem before delivery.

------------------------------------------------------------------------

# 10. Feature 8 --- AI Recommendation

After analysing the situation, the AI should provide a simple
recommendation.

Example:

``` text
🚨 Recommended Action

Shipment #1024 is affected by the Port A closure.

Recommendation:
Move the shipment to Port B.

Reason:
• Port A is unavailable.
• Port B has available capacity.
• New route reduces expected delay.
• Suitable truck is available nearby.
```

------------------------------------------------------------------------

# 11. Feature 9 --- AI Chat Assistant

Users can ask:

> "Which shipments are affected by the port closure?"

> "Which trucks are currently idle?"

> "Give me an alternative route for Shipment #1024."

> "Which cold-chain shipments have temperature problems?"

> "What should we do first?"

The AI should answer using the current supply-chain data.

------------------------------------------------------------------------

# 12. Suggested Dashboard

``` text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚚 SUPPLYFLOW AI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Active Shipments          500
Delayed Shipments          37
Disrupted Shipments        21
Idle Fleet Assets           8
Cold Chain Alerts           4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Then show:

``` text
🚨 ACTIVE DISRUPTIONS

Port A Closure
37 shipments affected

Heavy Rain
12 shipments affected

Road Block
8 shipments affected
```

------------------------------------------------------------------------

# 13. Shipment Details

Clicking a shipment should show:

``` text
Shipment #1024

Origin: Ahmedabad
Destination: Mumbai

Status: ⚠ Delayed

Current Route:
Ahmedabad → Port A → Mumbai

Problem:
Port A Closed

Recommended Route:
Ahmedabad → Port B → Mumbai

Expected Delay:
2 hours

Alternative Truck:
Truck #27
```

------------------------------------------------------------------------

# 14. Cold Chain Screen

Show temperature status:

  Shipment   Required Temp     Current Temp Status
  ---------- --------------- -------------- ----------
  #500       2--8°C                     5°C ✓ Normal
  #501       2--8°C                    11°C 🔴 Alert
  #502       15--25°C                  20°C ✓ Normal

------------------------------------------------------------------------

# 15. No ML Model Training Required

The basic prototype can be built without training an ML model.

Use:

``` text
Shipment data
+
Route data
+
Fleet data
+
Disruption data
+
Sensor data
+
Rules
+
Route/optimization algorithms
+
LLM
```

The system can use rules and optimisation to find affected shipments and
better routes.

The AI/LLM can be used to:

-   Explain disruptions
-   Summarise the situation
-   Answer questions
-   Generate recommendations
-   Create reports

------------------------------------------------------------------------

# 16. Dataset Strategy

For the prototype, use a combination of:

-   Public transportation/logistics data where suitable
-   Open route/map data
-   Public weather/disruption information
-   Synthetic shipment data
-   Synthetic fleet data
-   Synthetic cold-chain sensor data

The exact data sources can be selected during implementation.

------------------------------------------------------------------------

# 17. IBM Bob Usage

IBM Bob can help us:

-   Plan the application
-   Create the project structure
-   Write code
-   Implement features
-   Review code
-   Debug problems
-   Run commands
-   Improve the application

The IBM Bob guide describes Bob's planning, implementation, code-review,
terminal and external-tool capabilities. fileciteturn0file1L10-L18

------------------------------------------------------------------------

# 18. Most Important Features for MVP

### Must Have

-   [ ] Shipment dashboard
-   [ ] Disruption detection
-   [ ] Find affected shipments
-   [ ] Route recommendation
-   [ ] Fleet availability
-   [ ] Cold-chain temperature alerts
-   [ ] AI recommendation
-   [ ] Simple dashboard

### Nice to Have

-   [ ] AI chat
-   [ ] Interactive map
-   [ ] Advanced route optimisation
-   [ ] Report export
-   [ ] More disruption types

------------------------------------------------------------------------

# 19. Simple Demo Flow

### Step 1

Show the dashboard:

``` text
500 Active Shipments
37 Delayed
8 Idle Fleet Assets
4 Cold Chain Alerts
```

### Step 2

Trigger a disruption:

``` text
🚨 Port A Closed
```

### Step 3

System identifies:

``` text
37 affected shipments
```

### Step 4

Select one shipment.

Show:

``` text
Current Route ❌

Alternative Route ✓
```

### Step 5

Show an idle truck that can be used.

### Step 6

Show a cold-chain shipment with a temperature problem.

### Step 7

Ask the AI:

> "What should we do first?"

AI provides a prioritised recommendation.

------------------------------------------------------------------------

# 20. Main Idea in One Example

Without SupplyFlow:

``` text
Disruption
    ↓
Human checks hundreds of shipments
    ↓
Finds affected routes
    ↓
Finds available vehicles
    ↓
Manually decides what to do
```

With SupplyFlow:

``` text
Disruption
    ↓
SupplyFlow AI
    ↓
Find affected shipments
    ↓
Find available fleet
    ↓
Suggest alternative routes
    ↓
Check cold-chain problems
    ↓
Give recommended actions
```

------------------------------------------------------------------------

# 21. Final Project Definition

> **SupplyFlow AI is an AI-powered supply-chain assistant that detects
> disruptions, identifies affected shipments, recommends alternative
> routes and carriers, finds idle fleet assets, and detects cold-chain
> temperature problems.**

------------------------------------------------------------------------

## Official L2 Requirements

The project must remain focused on these official requirements:

1.  Identify shipments affected by an active disruption.
2.  Recommend rerouting or alternative carriers.
3.  Identify idle fleet assets for redeployment.
4.  Monitor cold-chain sensor logs and detect temperature excursions.

Everything else in this document is a proposed feature or implementation
idea.
