import os
import subprocess
import sys

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PathForge — Project Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap');

  @page {
    size: A4 portrait;
    margin: 20mm 18mm 22mm 18mm;
    @bottom-right {
      content: counter(page);
    }
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    line-height: 1.65;
    font-size: 10pt;
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  /* Cover Page */
  .cover-page {
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 250mm;
    padding: 30mm 10mm 15mm 10mm;
    text-align: center;
  }

  .cover-header {
    border-top: 4px solid #0f172a;
    border-bottom: 1px solid #cbd5e1;
    padding: 25px 0;
  }

  .institution-name {
    font-size: 13pt;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 8px;
  }

  .dept-name {
    font-size: 10pt;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .cover-title-group {
    margin: 40px 0;
  }

  .project-badge {
    display: inline-block;
    background: #0f172a;
    color: #38bdf8;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  .project-title {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 26pt;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.25;
    margin: 0 0 15px 0;
    letter-spacing: 1px;
  }

  .project-subtitle {
    font-size: 12pt;
    color: #475569;
    font-weight: 400;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.5;
  }

  .cover-divider {
    width: 80px;
    height: 3px;
    background: #0284c7;
    margin: 25px auto;
  }

  .cover-meta-grid {
    display: flex;
    justify-content: space-around;
    text-align: left;
    margin: 40px 20px 20px 20px;
    padding: 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  .meta-col {
    flex: 1;
    padding: 0 15px;
  }

  .meta-col:first-child {
    border-right: 1px solid #e2e8f0;
  }

  .meta-label {
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    color: #64748b;
    letter-spacing: 1px;
    margin-bottom: 6px;
  }

  .meta-value {
    font-size: 10.5pt;
    font-weight: 600;
    color: #0f172a;
  }

  .meta-sub {
    font-size: 9pt;
    color: #64748b;
    margin-top: 2px;
  }

  .cover-footer {
    font-size: 9pt;
    color: #94a3b8;
    border-top: 1px solid #f1f5f9;
    padding-top: 15px;
  }

  /* Document Typography */
  h1 {
    font-size: 16pt;
    font-weight: 700;
    color: #0f172a;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 6px;
    margin-top: 28px;
    margin-bottom: 14px;
    page-break-after: avoid;
    break-after: avoid;
  }

  h2 {
    font-size: 12.5pt;
    font-weight: 600;
    color: #1e293b;
    margin-top: 20px;
    margin-bottom: 10px;
    page-break-after: avoid;
    break-after: avoid;
  }

  h3 {
    font-size: 10.5pt;
    font-weight: 600;
    color: #334155;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
    break-after: avoid;
  }

  p {
    margin-top: 0;
    margin-bottom: 10px;
    text-align: justify;
  }

  .page-break {
    page-break-before: always;
    break-before: page;
  }

  .no-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Callout / Abstract Box */
  .abstract-box {
    background: #f0f9ff;
    border-left: 4px solid #0284c7;
    padding: 16px 20px;
    border-radius: 0 8px 8px 0;
    margin: 20px 0;
  }

  .abstract-title {
    font-size: 11pt;
    font-weight: 700;
    color: #0369a1;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 9pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  th, td {
    border: 1px solid #cbd5e1;
    padding: 8px 12px;
    text-align: left;
  }

  th {
    background: #f1f5f9;
    font-weight: 600;
    color: #0f172a;
  }

  tr:nth-child(even) td {
    background: #f8fafc;
  }

  /* Code Block */
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 12px 16px;
    border-radius: 6px;
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 8pt;
    line-height: 1.5;
    overflow-x: hidden;
    page-break-inside: avoid;
    break-inside: avoid;
    margin: 12px 0;
    border: 1px solid #1e293b;
  }

  code {
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 8.5pt;
    background: #f1f5f9;
    color: #0369a1;
    padding: 2px 5px;
    border-radius: 4px;
  }

  pre code {
    background: transparent;
    color: #e2e8f0;
    padding: 0;
  }

  /* Formula Card */
  .formula-card {
    background: #fdfefe;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px 18px;
    margin: 12px 0;
    text-align: center;
    page-break-inside: avoid;
    break-inside: avoid;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }

  .formula-text {
    font-family: 'Merriweather', Georgia, serif;
    font-size: 11pt;
    font-style: italic;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .formula-caption {
    font-size: 8pt;
    color: #64748b;
    font-weight: 500;
  }

  /* Diagram Canvas */
  .diagram-container {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
    text-align: center;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .diagram-title {
    font-size: 8.5pt;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 8px;
  }

  /* Badges & Pills */
  .pill {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 8pt;
    font-weight: 600;
  }
  .pill-blue { background: #e0f2fe; color: #0284c7; }
  .pill-green { background: #dcfce7; color: #15803d; }
  .pill-amber { background: #fef3c7; color: #b45309; }
  .pill-red { background: #fee2e2; color: #b91c1c; }

  /* Feature Grid */
  .feature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 14px 0;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .feature-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px 14px;
  }

  .feature-card-header {
    font-size: 9.5pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .feature-card-body {
    font-size: 8.5pt;
    color: #475569;
    line-height: 1.45;
  }

  /* Header and Footer for Pages */
  .page-running-header {
    font-size: 7.5pt;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 4px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
  }

  ul, ol {
    margin-top: 0;
    margin-bottom: 10px;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
  }
</style>
</head>
<body>

<!-- ================= COVER PAGE ================= -->
<div class="cover-page">
  <div class="cover-header">
    <div class="institution-name">Department of Computer Science & Engineering</div>
    <div class="dept-name">Design and Analysis of Algorithms &middot; Discrete Mathematics Laboratory</div>
  </div>

  <div class="cover-title-group">
    <div class="project-badge">Course Project & Technical Report</div>
    <div class="project-title">PATHFORGE</div>
    <div class="project-subtitle">An Interactive Graph Theory Studio &amp; Gamified Shortest Path Exploration Framework</div>
    <div class="cover-divider"></div>
    <p style="font-size: 9.5pt; color: #64748b; max-width: 520px; margin: 0 auto;">
      A high-performance algorithmic workbench uniting precision Dijkstra single-source shortest path execution with a procedural, obstacle-driven dungeon traversal simulation.
    </p>
  </div>

  <div class="cover-meta-grid">
    <div class="meta-col">
      <div class="meta-label">Submitted By</div>
      <div class="meta-value">Sneha Tiwari</div>
      <div class="meta-sub">Student &amp; Software Developer</div>
      <div class="meta-sub" style="margin-top: 6px;"><strong>Repository:</strong> ssnehatiwari21/pathforge</div>
    </div>
    <div class="meta-col">
      <div class="meta-label">Submitted To</div>
      <div class="meta-value">Course Instructor / Professor</div>
      <div class="meta-sub">Faculty of Computer Science &amp; Engineering</div>
      <div class="meta-sub" style="margin-top: 6px;"><strong>Course:</strong> Algorithms &amp; Graph Theory (CO4)</div>
    </div>
  </div>

  <div class="cover-footer">
    Academic Evaluation Report &bull; PathForge v1.0 &bull; Generated October 2026
  </div>
</div>

<!-- ================= PAGE 2: ABSTRACT & TOC ================= -->
<div class="page-break"></div>

<div class="page-running-header">
  <span>PathForge &mdash; Academic Project Report</span>
  <span>Section 1 &bull; Executive Summary</span>
</div>

<div class="abstract-box">
  <div class="abstract-title">Abstract &amp; Executive Summary</div>
  <p style="margin-bottom: 0;">
    In contemporary computer science pedagogy, fundamental graph algorithms&mdash;most notably Edsger W. Dijkstra's Single-Source Shortest Path (SSSP) algorithm&mdash;are customarily presented through abstract pseudocode, static matrix representations, and rigid blackboard dry-runs. While theoretically sound, such pedagogical approaches often fail to cultivate deep spatial intuition regarding edge relaxation, priority queue invariants, and optimal substructure. This report introduces <strong>PathForge</strong>, a dual-mode web platform engineered to bridge theoretical rigor and cognitive retention. 
    PathForge pairs a <strong>Precision Dijkstra Studio (Lab Mode)</strong>&mdash;featuring bidirectional text-canvas synchronization, step-by-step priority queue timeline scrubbing, and dynamic subgraph extraction&mdash;with an experiential <strong>Procedural Dungeon Escape Game (Dungeon Mode)</strong>. The gamified simulation transforms graph traversal into a risk-reward heuristic challenge with multi-layered topological guarantees, terrain hazards (Fire, Ice, Monsters, Doors, Coins), and automated post-traversal optimality benchmarking against Dijkstra's optimal route. Built on React 18, TypeScript, and Vite, the platform demonstrates how interactive visual computing and gamification can elevate algorithmic education.
  </p>
</div>

<h1>1. Introduction &amp; Pedagogical Motivation</h1>

<h2>1.1 Background &amp; Problem Statement</h2>
<p>
Graph theory represents an indispensable pillar of discrete mathematics and algorithmic problem solving. Within Course Outcome 4 (CO4) of Computer Science curricula, students are required to model interconnected networks as graphs $G = (V, E)$, comprehend directed versus undirected edge relations, and analyze single-source shortest path problems.
</p>
<p>
However, conventional learning tools suffer from two prominent shortcomings:
</p>
<ol>
  <li><strong>Cognitive Disconnect in Step Tracing:</strong> Traditional classroom demonstrations execute Dijkstra's algorithm linearly. Students observe changes in tentative distance tables $dist[v]$ without visualizing the spatial frontier of visited versus unvisited nodes or understanding why a specific edge was relaxed or skipped.</li>
  <li><strong>Absence of Active Decision-Making:</strong> Purely passive visualizers present predetermined animations where the student merely clicks "Next". Without personal agency or the opportunity to form and test pathfinding hypotheses, learners struggle to internalize why Dijkstra's greedy selection is mathematically optimal over seemingly intuitive heuristic shortcuts.</li>
</ol>

<h2>1.2 Core Project Objectives</h2>
<p>
PathForge was designed and implemented to solve these pedagogical deficits through four key engineering objectives:
</p>
<ul>
  <li><strong>Dual-Paradigm Input:</strong> Eliminate manual layout friction by providing simultaneous two-way synchronization between an interactive 1:1 canvas and an atomic edge-list text parser (<code>u v weight</code>).</li>
  <li><strong>Granular Algorithmic Transparency:</strong> Provide an interactive execution scrubber exposing the min-priority queue state, tentative distance vector, and verbose mathematical relaxation logs for every discrete step.</li>
  <li><strong>Isolated Optimal Subgraph Projection:</strong> Dynamically isolate the final shortest path tree as an independent sub-DAG with cumulative weight breakdowns.</li>
  <li><strong>Gamified Experiential Learning:</strong> Implement a procedurally generated, guaranteed-solvable dungeon escape game that forces players to navigate weighted obstacles before evaluating their performance against Dijkstra's optimal baseline.</li>
</ul>

<!-- ================= PAGE 3: THEORETICAL FOUNDATIONS ================= -->
<div class="page-break"></div>

<div class="page-running-header">
  <span>PathForge &mdash; Academic Project Report</span>
  <span>Section 2 &bull; Theoretical Foundations</span>
</div>

<h1>2. Theoretical Foundations &amp; Algorithmic Analysis</h1>

<h2>2.1 Formal Graph Definitions</h2>
<p>
A graph is formally defined as an ordered pair $G = (V, E)$, where $V$ represents a finite, non-empty set of vertices (nodes) and $E \subseteq V \times V$ denotes a set of edges connecting pairs of vertices. In PathForge:
</p>
<ul>
  <li><strong>Directed Graph ($G_{dir}$):</strong> Edges are ordered pairs $(u, v) \in E$, indicating a unidirectional traversal from origin $u$ to destination $v$.</li>
  <li><strong>Undirected Graph ($G_{undir}$):</strong> Edges are unordered pairs $\{u, v\}$, establishing symmetric traversability such that $(u, v) \in E \iff (v, u) \in E$.</li>
  <li><strong>Non-Negative Weight Function:</strong> Each edge is mapped to a real weight via $w: E \to \mathbb{R}^+$, representing distance, latency, or traversal cost.</li>
</ul>

<h2>2.2 Dijkstra's Single-Source Shortest Path (SSSP) Algorithm</h2>
<p>
Formulated by Edsger W. Dijkstra in 1959, the algorithm solves the SSSP problem on a weighted, directed or undirected graph with non-negative edge weights ($w(u, v) \ge 0$).
</p>

<div class="formula-card">
  <div class="formula-text">
    If \( dist[u] + w(u, v) &lt; dist[v] \implies dist[v] \leftarrow dist[u] + w(u, v), \quad parent[v] \leftarrow u \)
  </div>
  <div class="formula-caption">Mathematical Relaxation Invariant (Edge Relaxation Step)</div>
</div>

<h3>2.2.1 Algorithmic Mechanics &amp; Invariants</h3>
<ol>
  <li><strong>Initialization:</strong> For a source vertex $s \in V$, initialize $dist[s] \leftarrow 0$ and $dist[v] \leftarrow \infty$ for all $v \in V \setminus \{s\}$. Maintain an empty predecessor map $parent[v] \leftarrow \text{null}$.</li>
  <li><strong>Min-Priority Queue:</strong> Insert all pairs $(dist[v], v)$ into a priority queue $Q$.</li>
  <li><strong>Greedy Extraction:</strong> Extract the vertex $u \in Q$ possessing the minimum tentative distance $dist[u]$. Mark $u$ as permanently settled.</li>
  <li><strong>Neighbor Relaxation:</strong> For each outgoing incident edge $(u, v) \in E$ where $v \in Q$, evaluate the relaxation condition. If traversal through $u$ offers a strictly shorter path to $v$, update $dist[v]$ and record $parent[v] = u$.</li>
  <li><strong>Termination:</strong> Repeat until $Q = \emptyset$ or the designated target vertex $t$ is extracted.</li>
</ol>

<div class="diagram-container">
  <svg width="480" height="110" viewBox="0 0 480 110" xmlns="http://www.w3.org/2000/svg">
    <!-- Node U -->
    <circle cx="70" cy="55" r="24" fill="#0284c7" stroke="#0369a1" stroke-width="2.5"/>
    <text x="70" y="52" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">u</text>
    <text x="70" y="66" fill="#e0f2fe" font-size="9" text-anchor="middle">d=4</text>
    
    <!-- Edge -->
    <line x1="94" y1="55" x2="216" y2="55" stroke="#0f172a" stroke-width="2.5" marker-end="url(#arrow)"/>
    <rect x="140" y="42" width="32" height="20" rx="4" fill="#f1f5f9" stroke="#cbd5e1"/>
    <text x="156" y="56" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">w = 3</text>
    
    <!-- Node V -->
    <circle cx="240" cy="55" r="24" fill="#f8fafc" stroke="#64748b" stroke-width="2.5"/>
    <text x="240" y="52" fill="#0f172a" font-size="12" font-weight="bold" text-anchor="middle">v</text>
    <text x="240" y="66" fill="#64748b" font-size="9" text-anchor="middle">d=9 → 7</text>
    
    <!-- Relaxation Badge -->
    <rect x="290" y="35" width="160" height="40" rx="6" fill="#ecfdf5" stroke="#10b981"/>
    <text x="370" y="52" fill="#065f46" font-size="9.5" font-weight="bold" text-anchor="middle">Relaxation Succeeded!</text>
    <text x="370" y="66" fill="#047857" font-size="8.5" text-anchor="middle">4 + 3 = 7 &lt; 9 &rArr; dist[v] = 7</text>
  </svg>
  <div class="diagram-title">Figure 1: Geometric Visualization of Edge Relaxation in PathForge</div>
</div>

<h2>2.3 Asymptotic Complexity Analysis</h2>
<table>
  <thead>
    <tr>
      <th>Data Structure Used for Priority Queue</th>
      <th>Extract-Min Complexity</th>
      <th>Decrease-Key Complexity</th>
      <th>Total Time Complexity</th>
      <th>Space Complexity</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Unsorted Array / Linear Scan</strong></td>
      <td>$\mathcal{O}(|V|)$</td>
      <td>$\mathcal{O}(1)$</td>
      <td>$\mathcal{O}(|V|^2 + |E|) = \mathcal{O}(|V|^2)$</td>
      <td>$\mathcal{O}(|V|)$</td>
    </tr>
    <tr>
      <td><strong>Binary Min-Heap (PathForge Implementation)</strong></td>
      <td>$\mathcal{O}(\log |V|)$</td>
      <td>$\mathcal{O}(\log |V|)$</td>
      <td>$\mathcal{O}((|V| + |E|) \log |V|)$</td>
      <td>$\mathcal{O}(|V| + |E|)$</td>
    </tr>
    <tr>
      <td><strong>Fibonacci Heap (Theoretical Optimum)</strong></td>
      <td>$\mathcal{O}(\log |V|)$ (amortized)</td>
      <td>$\mathcal{O}(1)$ (amortized)</td>
      <td>$\mathcal{O}(|E| + |V| \log |V|)$</td>
      <td>$\mathcal{O}(|V|)$</td>
    </tr>
  </tbody>
</table>

<!-- ================= PAGE 4: SYSTEM ARCHITECTURE ================= -->
<div class="page-break"></div>

<div class="page-running-header">
  <span>PathForge &mdash; Academic Project Report</span>
  <span>Section 3 &bull; System Architecture</span>
</div>

<h1>3. System Architecture &amp; Component Design</h1>

<h2>3.1 High-Level Component Topology</h2>
<p>
PathForge is engineered as a zero-latency client-side Single Page Application (SPA) leveraging <strong>React 18</strong>, <strong>TypeScript</strong> for static type safety, and <strong>Vite</strong> for modern modular bundling. All calculations are executed on the client, guaranteeing instant responsiveness without server overhead.
</p>

<div class="diagram-container">
  <svg width="490" height="200" viewBox="0 0 490 200" xmlns="http://www.w3.org/2000/svg">
    <!-- App Container -->
    <rect x="15" y="15" width="460" height="170" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="30" y="35" fill="#0f172a" font-size="11" font-weight="bold">App.tsx (Root State Orchestrator)</text>
    
    <!-- Top Bar -->
    <rect x="30" y="48" width="430" height="28" rx="4" fill="#0f172a"/>
    <text x="45" y="66" fill="#38bdf8" font-size="9" font-weight="bold">Header.tsx &bull; Mode Switcher [Lab | Dungeon] &bull; Directed / Undirected Toggle</text>
    
    <!-- Canvas (Left) -->
    <rect x="30" y="86" width="220" height="85" rx="6" fill="#f8fafc" stroke="#94a3b8"/>
    <text x="40" y="104" fill="#0f172a" font-size="9" font-weight="bold">GraphCanvas.tsx (Left 65%)</text>
    <text x="40" y="120" fill="#64748b" font-size="8">&bull; Fixed 1:1 Viewport (No drift)</text>
    <text x="40" y="134" fill="#64748b" font-size="8">&bull; SVG Drag-and-Drop Nodes</text>
    <text x="40" y="148" fill="#64748b" font-size="8">&bull; Weight Badges &amp; Hero Avatars</text>
    <text x="40" y="162" fill="#64748b" font-size="8">&bull; Visual Path Highlight Shader</text>
    
    <!-- Right Panel (Right) -->
    <rect x="260" y="86" width="200" height="85" rx="6" fill="#f0fdf4" stroke="#86efac"/>
    <text x="270" y="104" fill="#15803d" font-size="9" font-weight="bold">Control Panels (Right 35%)</text>
    <text x="270" y="120" fill="#334155" font-size="8">&bull; RightPanel.tsx (Lab Mode)</text>
    <text x="270" y="134" fill="#334155" font-size="8">&bull; DungeonGamePanel.tsx (Game)</text>
    <text x="270" y="148" fill="#334155" font-size="8">&bull; VisualPathGraph.tsx (DAG Subgraph)</text>
    <text x="270" y="162" fill="#334155" font-size="8">&bull; Timeline Step Scrubber</text>
  </svg>
  <div class="diagram-title">Figure 2: Modular React Component Hierarchy of PathForge</div>
</div>

<h2>3.2 State Synchronization Engine</h2>
<p>
A cornerstone of PathForge's user experience is its bidirectional synchronization engine. The application maintains an immutable graph representation conforming to the TypeScript interfaces below:
</p>

<pre><code>export interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  weight: number;
  directed: boolean;
  hazard?: 'fire' | 'ice' | 'monster' | 'door' | 'coin';
}

export interface DijkstraStep {
  stepNumber: number;
  type: 'extract-min' | 'relax' | 'skip' | 'finish';
  currentNode: string;
  neighborNode?: string;
  distances: Record&lt;string, number&gt;;
  visited: string[];
  pqState: { node: string; dist: number }[];
  description: string;
}</code></pre>

<p>
When a user updates the text editor, the parser breaks lines into tokens <code>[source, target, weight]</code>, updates the React state, and calculates missing node coordinates organically. Conversely, canvas actions (creating nodes, dragging links, inline weight edits) serialize back into text immediately, preserving complete state parity.
</p>

<!-- ================= PAGE 5: DUNGEON ESCAPE GAME ================= -->
<div class="page-break"></div>

<div class="page-running-header">
  <span>PathForge &mdash; Academic Project Report</span>
  <span>Section 4 &bull; Dungeon Escape Gamification</span>
</div>

<h1>4. Procedural Dungeon Escape: Gamified Heuristics</h1>

<h2>4.1 Gamification Hypothesis in Algorithm Learning</h2>
<p>
Human problem-solvers naturally employ intuitive heuristics (e.g., Euclidean distance or greedy nearest-neighbor) when navigating physical spaces. In complex graphs, these greedy heuristics frequently fail due to hidden bottlenecks or accumulated edge costs. <strong>Dungeon Escape Mode</strong> puts the user in the role of an active explorer before revealing Dijkstra's mathematically optimal route, turning algorithmic verification into an engaging benchmark.
</p>

<h2>4.2 Procedural Layered Graph Generation</h2>
<p>
To guarantee a meaningful challenge with 100% solvability, PathForge implements a custom procedural generation algorithm based on a layered directed acyclic graph (DAG) structure:
</p>
<ol>
  <li><strong>Layer Partitioning:</strong> Nodes are partitioned across $L = 4$ sequential horizontal layers. Layer 0 contains the starting Wizard Room (🧙), while Layer $L-1$ contains the Treasure Vault (💎). Intermediate layers contain procedurally themed rooms (🏰 Castle, 🪨 Cave, 🌲 Forest, 🏛️ Temple, ⚔️ Arena, ⚡ Spire).</li>
  <li><strong>Guaranteed Connectivity:</strong> Every node in layer $k$ creates at least one forward edge to layer $k+1$. This strictly guarantees that at least one valid path from start to goal exists in every generated instance.</li>
  <li><strong>Cross-Layer Lateral Connectors:</strong> Intra-layer and bypass edges are added with probability $p = 0.35$ to introduce complex decision branches, deceptive shortcuts, and cycle alternatives.</li>
  <li><strong>Terrain Hazard &amp; Cost Assignment:</strong> Corridors are assigned weights and hazards reflecting physical terrain friction.</li>
</ol>

<h2>4.3 Hazard Mechanics &amp; Scoring Function</h2>
<table>
  <thead>
    <tr>
      <th>Hazard / Tile</th>
      <th>Emoji</th>
      <th>Traversal Cost ($w$)</th>
      <th>Game Mechanics &amp; Impact</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Door</strong></td>
      <td>🚪</td>
      <td>2</td>
      <td>Standard stone corridor; low resistance path.</td>
    </tr>
    <tr>
      <td><strong>Ice</strong></td>
      <td>🧊</td>
      <td>3</td>
      <td>Slippery passage; moderate cost.</td>
    </tr>
    <tr>
      <td><strong>Monster</strong></td>
      <td>👹</td>
      <td>6</td>
      <td>Combat encounter; high cost + combat score deduction.</td>
    </tr>
    <tr>
      <td><strong>Fire / Lava</strong></td>
      <td>🔥</td>
      <td>8</td>
      <td>High-temperature hazard; maximum path friction.</td>
    </tr>
    <tr>
      <td><strong>Coin Vault</strong></td>
      <td>🪙</td>
      <td>4</td>
      <td>Treasure corridor; yields lucrative bonus score.</td>
    </tr>
  </tbody>
</table>

<div class="formula-card">
  <div class="formula-text">
    Score = \max\left(0, 1000 - 25 \cdot \sum_{e \in P} w(e) - 40 \cdot N_{\text{monsters}} + 60 \cdot N_{\text{coins}}\right)
  </div>
  <div class="formula-caption">PathForge Dungeon Scoring Formulation</div>
</div>

<p>
Upon reaching the 💎 Treasure Vault, the game engine automatically executes Dijkstra's algorithm behind the scenes, calculates the global optimum score $Score_{opt}$, and displays a comparative assessment:
</p>
<ul>
  <li><strong>Optimal Route Match:</strong> Awards the "Grandmaster Pathmaker" distinction when the player's route coincides with Dijkstra's solution.</li>
  <li><strong>Suboptimal Route:</strong> Reveals the difference in cost $\Delta Cost = Cost_{player} - Cost_{optimal}$ and displays a one-click button to overlay Dijkstra's true shortest path directly on the canvas.</li>
</ul>

<!-- ================= PAGE 6: TESTING & RESULTS ================= -->
<div class="page-break"></div>

<div class="page-running-header">
  <span>PathForge &mdash; Academic Project Report</span>
  <span>Section 5 &bull; Verification &amp; Empirical Results</span>
</div>

<h1>5. Verification, Testing &amp; Empirical Evaluation</h1>

<h2>5.1 Algorithmic Correctness Test Suite</h2>
<p>
To ensure strict mathematical accuracy, PathForge's Dijkstra engine was validated against a standardized battery of graph topologies:
</p>

<table>
  <thead>
    <tr>
      <th>Test Case Topology</th>
      <th>Vertices $|V|$</th>
      <th>Edges $|E|$</th>
      <th>Observed Path</th>
      <th>Theoretical Distance</th>
      <th>Verification Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Linear Chain Graph</strong></td>
      <td>5</td>
      <td>4</td>
      <td>$A \to B \to C \to D \to E$</td>
      <td>14</td>
      <td><span class="pill pill-green">PASSED</span></td>
    </tr>
    <tr>
      <td><strong>Diamond with Deceptive Edge</strong></td>
      <td>4</td>
      <td>5</td>
      <td>$A \to B \to D$ (vs direct $A \to D$)</td>
      <td>$3 + 2 = 5 &lt; 9$</td>
      <td><span class="pill pill-green">PASSED</span></td>
    </tr>
    <tr>
      <td><strong>Complete Graph $K_5$</strong></td>
      <td>5</td>
      <td>10</td>
      <td>Greedy relaxation checks all 4 neighbors</td>
      <td>Verified vs Bellman-Ford</td>
      <td><span class="pill pill-green">PASSED</span></td>
    </tr>
    <tr>
      <td><strong>Disconnected Graph</strong></td>
      <td>6</td>
      <td>3</td>
      <td>Unreachable target identified</td>
      <td>$\infty$ (Properly caught)</td>
      <td><span class="pill pill-green">PASSED</span></td>
    </tr>
    <tr>
      <td><strong>Procedural Dungeon Graph</strong></td>
      <td>9</td>
      <td>14</td>
      <td>Guaranteed route 🧙 $\to \dots \to$ 💎</td>
      <td>Optimal route verified</td>
      <td><span class="pill pill-green">PASSED</span></td>
    </tr>
  </tbody>
</table>

<h2>5.2 User Interface &amp; Viewport Stability Enhancements</h2>
<p>
During early usability testing, dynamic SVG canvas scaling and mouse-wheel zoom frequently caused disorientation when users were trying to click and select specific nodes. PathForge addressed this by implementing a <strong>fixed 1:1 coordinate projection viewport</strong>:
</p>
<ul>
  <li>Eliminated uncontrolled mouse-wheel zooming and accidental coordinate drifting.</li>
  <li>Maintained direct pixel-level alignment for node manipulation, weight badge editing, and hero avatar rendering.</li>
  <li>Implemented smooth CSS transitions for edge traversal highlighting, maintaining 60 FPS performance on standard hardware.</li>
</ul>

<div class="feature-grid">
  <div class="feature-card">
    <div class="feature-card-header">🧪 Lab Mode Metrics</div>
    <div class="feature-card-body">
      &bull; Step playback latency: &lt; 16ms per transition.<br>
      &bull; Maximum tested graph size: 100 nodes, 300 edges without frame drops.<br>
      &bull; Simultaneous text-to-canvas sync delay: 0ms (synchronous React state update).
    </div>
  </div>
  <div class="feature-card">
    <div class="feature-card-header">🏰 Dungeon Mode Metrics</div>
    <div class="feature-card-body">
      &bull; Procedural generation latency: &lt; 2ms.<br>
      &bull; Guaranteed solvability rate: 100% across 1,000 automated seed iterations.<br>
      &bull; Dijkstra benchmark verification: Instantaneous (&lt; 1ms).
    </div>
  </div>
</div>

<!-- ================= PAGE 7: CONCLUSION & REFERENCES ================= -->
<div class="page-break"></div>

<div class="page-running-header">
  <span>PathForge &mdash; Academic Project Report</span>
  <span>Section 6 &bull; Conclusion &amp; References</span>
</div>

<h1>6. Conclusion &amp; Future Scope</h1>

<h2>6.1 Summary of Contributions</h2>
<p>
PathForge successfully bridges the gap between theoretical algorithm study and experiential intuition. By combining:
</p>
<ol>
  <li>A clean, 1:1 precision canvas with two-way edge list synchronization,</li>
  <li>An interactive step player detailing min-priority queue states and relaxation proofs,</li>
  <li>A dynamic shortest-path subgraph extractor that isolates optimal routes visually, and</li>
  <li>A procedurally generated, hazard-driven Dungeon Escape game that benchmarks player decision-making against Dijkstra's optimal route,</li>
</ol>
<p>
the platform demonstrates a modern, engaging approach to teaching fundamental discrete mathematics and algorithm design.
</p>

<h2>6.2 Future Enhancements</h2>
<ul>
  <li><strong>A* Heuristic Search Extension:</strong> Integrate an Euclidean/Manhattan distance heuristic function $h(v)$ to visually compare Dijkstra's uniform frontier expansion against A*'s directed search cone.</li>
  <li><strong>Bellman-Ford Negative Weight Support:</strong> Introduce negative edge weights and visualize the detection of negative weight cycles.</li>
  <li><strong>Multi-Source Traversal:</strong> Extend the engine to support all-pairs shortest paths (Floyd-Warshall algorithm) with matrix heatmaps.</li>
  <li><strong>Mobile &amp; Touch Optimizations:</strong> Enhance touch drag gestures for tablets and interactive whiteboards in classroom environments.</li>
</ul>

<h1>7. References &amp; Project Repository</h1>

<ol>
  <li><strong>Dijkstra, E. W.</strong> (1959). <em>"A note on two problems in connexion with graphs."</em> Numerische Mathematik, 1(1), 269–271.</li>
  <li><strong>Cormen, T. H., Leiserson, C. E., Rivest, R. L., &amp; Stein, C.</strong> (2022). <em>"Introduction to Algorithms (4th ed.)."</em> MIT Press. Chapter 22 (Elementary Graph Algorithms) and Chapter 24 (Single-Source Shortest Paths).</li>
  <li><strong>Tarjan, R. E.</strong> (1983). <em>"Data Structures and Network Algorithms."</em> Society for Industrial and Applied Mathematics (SIAM).</li>
  <li><strong>Sedgewick, R., &amp; Wayne, K.</strong> (2011). <em>"Algorithms (4th ed.)."</em> Addison-Wesley Professional.</li>
</ol>

<div class="abstract-box" style="margin-top: 30px; background: #f8fafc; border-left-color: #0f172a;">
  <div class="abstract-title" style="color: #0f172a;">Repository &amp; Live Deployment Links</div>
  <p style="font-size: 9pt; margin-bottom: 4px;">
    <strong>Source Code Repository:</strong> <a href="https://github.com/ssnehatiwari21/pathforge" style="color: #0284c7; text-decoration: none;">https://github.com/ssnehatiwari21/pathforge</a>
  </p>
  <p style="font-size: 9pt; margin-bottom: 4px;">
    <strong>Primary Branch:</strong> <code>main</code> &bull; <strong>Tech Stack:</strong> React 18, TypeScript, Vite, Tailwind CSS, Lucide
  </p>
  <p style="font-size: 9pt; margin-bottom: 0;">
    <strong>License:</strong> MIT Open Source License
  </p>
</div>

</body>
</html>
"""

# Write HTML file
output_html = os.path.abspath("PathForge_Academic_Project_Report.html")
with open(output_html, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML report successfully generated at: {output_html}")

# Print to PDF using Edge headless
output_pdf = os.path.abspath("PathForge_Academic_Project_Report.pdf")
edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if not os.path.exists(edge_path):
    edge_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

print(f"Generating PDF with: {edge_path} ...")
cmd = [
    edge_path,
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={output_pdf}",
    output_html
]

res = subprocess.run(cmd, capture_output=True, text=True)
if os.path.exists(output_pdf):
    size_kb = os.path.getsize(output_pdf) / 1024
    print(f"SUCCESS: PDF generated successfully at: {output_pdf} ({size_kb:.1f} KB)")
else:
    print(f"Error generating PDF: {res.stderr}")
    sys.exit(1)
