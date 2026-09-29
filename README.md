# Delhi Metro Route Optimizer

A backend project that models the Delhi Metro network as a graph and computes
optimal routes between stations using a Dijkstra's algorithm implementation
built entirely from scratch (own Graph, own MinHeap, no external libraries),
exposed through an Express REST API, with MongoDB storing a history of past
searches.

## Features

- Real Delhi Metro station and line data (Red, Yellow, Blue, Violet lines)
- Custom adjacency-list Graph
- Custom binary Min-Heap (no priority queue library)
- Dijkstra's shortest path algorithm, from scratch
- Distance-based and time-based route optimization
- Path reconstruction (full station-by-station route)
- Simple fare estimation
- REST API built with Express
- MongoDB-backed search history
- Automated tests (Jest + Supertest) that do not require MongoDB to run

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Web framework | Express 5 |
| Database | MongoDB (via Mongoose) |
| Testing | Jest, Supertest |
| Data format | JSON (station/connection dataset) |

## Architecture
