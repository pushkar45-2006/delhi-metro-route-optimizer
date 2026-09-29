# Data Sources — Delhi Metro Route Optimizer

## What is in this dataset

45 stations and 46 track-segment connections across four Delhi Metro lines:
**Red, Yellow, Blue, and Violet**. This is a deliberately manageable subset
of the full network (which has 250+ stations), chosen to include several
real interchange stations so the graph and Dijkstra work is meaningful.

## What is factually sourced

The following were verified against Wikipedia's Delhi Metro line articles
and station articles (which compile DMRC-published information), current
as of research done in September 2026:

- **Station names** — real Delhi Metro station names.
- **Line assignments** (which station belongs to which line) — real.
- **Interchange stations** — the following are real, currently operational
  interchanges:
  - **Kashmere Gate** — Red Line, Yellow Line, Violet Line
  - **Rajiv Chowk** — Yellow Line, Blue Line
  - **Central Secretariat** — Yellow Line, Violet Line
  - **Mandi House** — Blue Line, Violet Line
- **Station sequence / adjacency** (which station physically comes next on
  a line) — real, based on published line route order.

Sources consulted:
- https://en.wikipedia.org/wiki/List_of_Delhi_Metro_stations
- https://en.wikipedia.org/wiki/Yellow_Line_(Delhi_Metro)
- https://en.wikipedia.org/wiki/Violet_Line_(Delhi_Metro)
- https://en.wikipedia.org/wiki/Magenta_Line_(Delhi_Metro) (used only for
  cross-checking interchange/line data conventions, not included in dataset)
- https://en.wikipedia.org/wiki/Pink_Line_(Delhi_Metro) (same, cross-check only)

## What is NOT officially sourced (estimated)

**`distanceKm` and `travelTimeMin` values in `connections.json` are
project-model estimates, not official DMRC figures.**

I did not have access to a complete, verified, station-to-station official
distance/timing table for every segment in this subset. Rather than guess
and present numbers as if they were authoritative, every edge weight in
this dataset should be treated as a **reasonable approximation** based on:

- Typical Delhi Metro inter-station spacing (roughly 0.8–2.2 km between
  adjacent stations in central Delhi, distances tend to be tighter
  underground and wider on peripheral elevated sections).
- Typical travel time of 2–4 minutes between adjacent stations at
  normal operating speed.

**Do not present these specific numbers as official DMRC data.** They exist
so that Dijkstra (Part 2) has realistic-shaped weights to optimize over.
If real per-segment distance/time data becomes available later, only
`connections.json` needs to be updated — the graph and algorithm code do
not need to change.

## Known simplifications (by design, for this stage)

- Only 4 of Delhi Metro's ~12+ lines are modeled (Red, Yellow, Blue, Violet).
- Each line segment included is a contiguous chunk of the real line, not
  the full line end-to-end.
- Transfer time at interchange stations (walking between platforms) is
  **not yet modeled** — an interchange is currently just a single node
  that happens to belong to multiple lines. This is a reasonable future
  enhancement once the core Dijkstra logic is working.
- Airport Express, Green, Magenta, and Pink lines are not included yet.

## How to expand this later

- Add new station objects to `stations.json` (same shape: `id`, `name`,
  `lines`, `isInterchange`).
- Add new edges to `connections.json` (same shape: `from`, `to`, `line`,
  `distanceKm`, `travelTimeMin`).
- No code changes are needed in `Graph.js` or `buildGraph.js` — they load
  whatever is in these two files.