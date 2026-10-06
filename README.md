# Graph Theory Lab (CO4) — Interactive Graph Studio & Dijkstra Visualizer

A professional, high-performance web software for discrete mathematics and graph theory laboratories (Course Outcome 4 / CO4).

## 🚀 Getting Started

The application is running locally:
- **URL**: [http://127.0.0.1:5173](http://127.0.0.1:5173)

To run anytime from the terminal:
```bash
cd "C:\Users\Sneha Tiwari\.gemini\antigravity\scratch\graph-theory-lab"
npm run dev
```

---

## 🌟 Key Features

### 1. Interactive Dual-Mode Graph Canvas
- **Direct Canvas Editing**:
  - **Double-click empty canvas**: Spawns a new node.
  - **Click & Drag node**: Repositions the node with real-time edge recalculation.
  - **Alt/Ctrl + Drag from Node A to Node B**: Connects an edge between them.
  - **Double-click edge weight chip**: Edits weight inline directly on the canvas.
  - **Right-click node or edge**: Deletes the element.
- **Physics Simulation**: Toggle auto-repelling force simulation to automatically untangle complex graphs.
- **Classic Presets**: Load Petersen Graph, Complete Graph $K_5$, Complete Bipartite $K_{3,3}$, Königsberg Eulerian Trail, or Dijkstra Routing Network.

### 2. Simultaneous Reactive Text & Table Input
- **Two-way Realtime Sync**:
  - Type edges in simple format: `u v weight` (e.g. `A B 4`, `B C 2`, `A C 7`).
  - As you type, the canvas graph updates immediately.
  - Changes made on the canvas immediately update the text representation in real time.
- **Quick Edge Form**: Quick-add edges via `[From] -> [To] [Weight]` form.

### 3. Comprehensive Graph Theory (CO4) Analytics
- **Degrees & Handshaking Lemma**:
  - Displays sorted degree sequences $\langle d_1, d_2, \dots, d_n \rangle$.
  - Exact Handshaking lemma verification: $\sum \deg(v) = 2|E|$ (undirected) or $\sum \deg^+ = \sum \deg^- = |E|$ (directed).
  - Identifies $k$-regular graphs.
- **Adjacency & Incidence Matrices**:
  - Formatted with mathematical matrix brackets.
  - **Interactive Hover Cross-Highlighting**: Hovering over cell $A_{ij}$ highlights vertex $i$, vertex $j$, and edge $(i, j)$ directly on the canvas.
- **Connectivity & Graph Topology**:
  - Connected components counter and vertex partition listing.
  - Cut-vertices (articulation points) and Bridges detection.
  - Strongly Connected Components (Kosaraju algorithm for directed graphs).
- **Bipartite Verification & 2-Coloring**:
  - BFS 2-coloring test with partition sets $V_1$ and $V_2$.
  - One-click button to project the 2-coloring directly onto canvas nodes.
  - Detects odd cycle counterexample if non-bipartite.
- **Eulerian & Hamiltonian Paths**:
  - Eulerian circuit and trail detection (Euler's theorem) + Hierholzer traversal path.
  - Hamiltonian cycle and path backtracking + Dirac and Ore condition checks.
- **Graph Isomorphism Checker**:
  - Side-by-side comparative tool to test if two graphs $G_1 \cong G_2$ are isomorphic, with discovered bijective mapping $\phi: V(G_1) \to V(G_2)$.

### 4. Animated Dijkstra Shortest Path Visualizer
- **Source & Target Selector**: Pick endpoints from dropdowns or click nodes directly on the canvas.
- **Timeline Scrubber & Step Player**:
  - Play, Pause, Next Step, Prev Step, Speed control (0.5x, 1x, 2x).
  - Scrubber slider to jump to any point in the algorithm's execution history.
  - Detailed step-by-step logs explaining every queue extraction, neighbor inspection, and edge relaxation.
  - Live tentative distance table $dist[v]$ and Min-Priority Queue snapshots.

### 5. Dynamic Subgraph Extraction
- Extracts the optimal shortest path into an isolated dynamic subgraph $G' = (V', E')$.
- Displays node-by-node hop breakdown with individual weights and cumulative distances.
- **Isolate Subgraph on Main Canvas**: One-click toggle to focus the main canvas solely on the extracted path.
