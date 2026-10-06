# ⚔️ PathForge — Dijkstra Studio & Dungeon Escape

**PathForge** is an interactive, visual graph theory platform that combines a precision **Dijkstra Shortest Path Studio (Lab Mode)** with an engaging procedural **Dungeon Escape Game (Dungeon Mode)**.

Designed for learners, educators, and algorithm enthusiasts, PathForge makes graph traversal intuitive, visual, and fun.

---

## 🎮 Modes Overview

PathForge features two dedicated modes accessible via the top navigation bar:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚔️ PathForge                 [ Lab | Dungeon ]  [ Directed ] │
└─────────────────────────────────────────────────────────────┘
```

### 1. 🧪 Lab Mode — Dijkstra Shortest Path Studio

A clean, distraction-free environment for constructing graphs and inspecting Dijkstra's algorithm step-by-step.

- **Fixed 1:1 Precision Canvas**:
  - **Add Nodes**: Double-click anywhere on the canvas.
  - **Move Nodes**: Click and drag to arrange your topology.
  - **Connect Edges**: Hold `Ctrl` or `Alt` and drag from one node to another.
  - **Edit Weights**: Double-click any weight badge directly on the canvas.
  - **Directed / Undirected**: Toggle edge directionality with a single click in the header.
- **Synchronized Text & Form Input**:
  - **Manual Edge List**: Type edges in standard format (`u v weight`, e.g., `A B 4`). Canvas and text stay in real-time two-way synchronization.
  - **Quick Edge Adder**: Convenient `From`, `To`, and `Weight` inputs for rapid graph construction.
- **Dijkstra Step-by-Step Player**:
  - Select any start and end node.
  - Interactive playback controls: Play, Pause, Next Step, Previous Step, and playback speed adjustments (`0.5x`, `1x`, `2x`).
  - Real-time priority queue inspection, tentative distance table, and algorithm logs explaining edge relaxations.
- **Shortest Path Subgraph Extraction**:
  - Visual SVG graph renderer that cleanly displays only the extracted optimal route.
  - Hop-by-hop breakdown showing individual weights and cumulative distances.
  - **"Isolate on Canvas"** toggle to dim distractions and spotlight the optimal path on the main graph.

---

### 2. 🏰 Dungeon Escape — Procedural Pathfinding Game

Put your pathfinding intuition to the test before letting the algorithm reveal the answer!

- **Procedural Solvable Dungeons**:
  - Every run generates a randomized, multi-layered dungeon guaranteed to have a viable path from the hero's starting room (🧙) to the treasure vault (💎).
  - Dynamic room themes: 🏰 Castle, 🪨 Cave, 🌲 Forest, 🏛️ Temple, ⚔️ Arena, ⚡ Spire.
- **Hazards & Terrain Costs**:
  - 🚪 **Door** (Cost: `2`) — Standard stone corridor.
  - 🧊 **Ice** (Cost: `3`) — Slippery, moderate path.
  - 👹 **Monster** (Cost: `6`) — Dangerous corridor with combat penalty.
  - 🔥 **Fire** (Cost: `8`) — High-damage lava route.
  - 🪙 **Coins** — Collectible rewards that boost your score.
- **Interactive Room-by-Room Gameplay**:
  - Click any adjacent room on the canvas to move your character.
  - Live dashboard tracking current room, route history, total cost, monsters fought, and coins gathered.
- **Live Scoring & Dijkstra Comparison**:
  - Score formula:
    $$\text{Score} = 1000 - (\text{Cost} \times 25) - (\text{Monsters} \times 40) + (\text{Coins} \times 60)$$
  - Reaching the 💎 Treasure Vault triggers a victory assessment comparing your route with Dijkstra's mathematically optimal path.
  - Reveal Dijkstra's route to see what you could have optimized or start a new procedural run.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn / pnpm

### Installation & Local Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ssnehatiwari21/pathforge.git
   cd pathforge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://127.0.0.1:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Algorithms**: Custom Dijkstra implementation with Min-Priority Queue state capture & procedural dungeon graph generator.

---

## 📜 License

MIT License. Free to use for educational, personal, and open-source projects.
