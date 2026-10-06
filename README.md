# PathForge

PathForge is an interactive web application for learning and experimenting with **Dijkstra's shortest path algorithm**.

It has two modes:

* **Lab Mode** — Build your own graph and watch Dijkstra's algorithm run step by step.
* **Dungeon Mode** — Play a small pathfinding game where different terrains have different movement costs, then compare your route with Dijkstra's optimal path.

## Features

### Lab Mode

Lab Mode lets you create and experiment with weighted graphs directly in the browser.

**Graph Editor**

* Add nodes by double-clicking on the canvas.
* Drag nodes to reposition them.
* Connect nodes using `Ctrl` or `Alt` + drag.
* Edit edge weights directly on the graph.
* Switch between directed and undirected graphs.
* Enter edges manually using the format:

```text
A B 4
B C 3
A C 8
```

The graph editor and edge list stay synchronized.

**Dijkstra Visualization**

Choose a source and destination node and run Dijkstra step by step.

The visualization shows:

* Current priority queue
* Tentative distances
* Relaxation steps
* Algorithm logs
* Current shortest path
* Cumulative path cost

You can control the playback using:

`Previous` · `Play` · `Pause` · `Next`

and change the speed between `0.5x`, `1x`, and `2x`.

### Shortest Path View

After running Dijkstra, PathForge extracts the shortest route and displays it separately.

You can see:

```text
A → B → D → F
  4   2   5

Total Cost = 11
```

There is also an **Isolate Path** option that dims the other nodes and edges on the main graph.

---

## Dungeon Mode

Dungeon Mode turns weighted pathfinding into a small game.

You start as 🧙 and need to reach the 💎 treasure while choosing your route through the dungeon.

Each dungeon is procedurally generated and guaranteed to have a path from the starting room to the treasure.

### Terrain Costs

| Terrain    | Cost |
| ---------- | ---: |
| 🚪 Door    |    2 |
| 🧊 Ice     |    3 |
| 👹 Monster |    6 |
| 🔥 Fire    |    8 |

Some rooms also contain 🪙 coins that increase your final score.

The dungeon can have different themes such as:

* Castle
* Cave
* Forest
* Temple
* Arena
* Spire

### Gameplay

Move between adjacent rooms by clicking them.

During the run, the game tracks:

* Current room
* Route taken
* Total path cost
* Monsters encountered
* Coins collected

When you reach the treasure, your route is compared with the path calculated by Dijkstra.

This lets you see whether your decision was actually optimal.

### Score

Your score is calculated using:

```text
Score = 1000
        - (Cost × 25)
        - (Monsters × 40)
        + (Coins × 60)
```

After finishing a run, you can reveal Dijkstra's route and compare it with your own.

---

## How Dijkstra Is Used

PathForge uses Dijkstra's algorithm in both modes.

### Lab Mode

The algorithm runs on a graph created by the user.

```text
Graph → Priority Queue → Relax Edges → Update Distances
                                      ↓
                              Shortest Path
```

The application captures the intermediate states so that each step can be visualized instead of only showing the final answer.

### Dungeon Mode

The dungeon is represented as a weighted graph.

* Each room is a node.
* Moving between rooms creates an edge.
* The terrain determines the edge weight.
* Dijkstra finds the minimum-cost route to the treasure.

This makes it easier to understand why the shortest path is not always the path with the fewest rooms.

---

## Tech Stack

* **React 18**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Lucide React**
* Custom Dijkstra implementation
* Min-priority queue for shortest path calculation
* Procedural dungeon generation

---

## Getting Started

### Requirements

* Node.js 18+
* npm, yarn, or pnpm

### Installation

Clone the repository:

```bash
git clone https://github.com/ssnehatiwari21/pathforge.git
cd pathforge
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown by Vite, usually:

```text
http://127.0.0.1:5173
```

### Production Build

```bash
npm run build
```

---

## Project Structure

A simplified structure of the application:

```text
pathforge/
├── src/
│   ├── components/
│   ├── algorithms/
│   │   └── dijkstra/
│   ├── dungeon/
│   ├── pages/
│   └── ...
├── public/
├── package.json
└── vite.config.ts
```

---

## Why PathForge?

Dijkstra's algorithm is usually taught using tables and static graphs.

PathForge tries to make the process more visual:

**Build → Run → Watch → Play → Compare**

Instead of only seeing the final shortest path, you can see how the algorithm reaches that answer and then test the same idea yourself through the dungeon game.

---

## License

Free to use for educational, personal, and open-source projects.
