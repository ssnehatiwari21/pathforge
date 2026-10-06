import React, { useState, useEffect } from 'react';
import { GraphNode, GraphEdge, DijkstraResult } from '../types/graph';
import { extractPathSubgraph } from '../algorithms/dijkstra';
import { Route, RotateCcw } from 'lucide-react';

interface VisualPathGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  dijkstraResult: DijkstraResult | null;
  showOnlyPathOnCanvas: boolean;
  onToggleShowOnlyPath: () => void;
  isDungeonMode?: boolean;
}

export const VisualPathGraph: React.FC<VisualPathGraphProps> = ({
  nodes,
  edges,
  dijkstraResult,
  showOnlyPathOnCanvas,
  onToggleShowOnlyPath,
  isDungeonMode = false,
}) => {
  if (!dijkstraResult) return null;

  if (!dijkstraResult.isReachable) {
    return (
      <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl text-center">
        <span className="text-xs font-semibold text-rose-300 block">
          {isDungeonMode ? 'No Escape Route Found!' : 'No Path Found'}
        </span>
        <p className="text-[11px] text-zinc-400 mt-1">
          {isDungeonMode
            ? 'The 💎 Treasure Vault cannot be reached from the 🧙 Hero start position.'
            : 'Destination node is unreachable from the source node in this graph.'}
        </p>
      </div>
    );
  }

  const subgraph = extractPathSubgraph(nodes, edges, dijkstraResult);
  const [animStep, setAnimStep] = useState<number>(subgraph.nodes.length);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);

  useEffect(() => {
    setAnimStep(subgraph.nodes.length);
    setIsReplaying(false);
  }, [dijkstraResult]);

  const handleReplay = () => {
    setAnimStep(1);
    setIsReplaying(true);
  };

  useEffect(() => {
    if (!isReplaying) return;
    if (animStep >= subgraph.nodes.length) {
      setIsReplaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setAnimStep((prev) => prev + 1);
    }, 450);
    return () => clearTimeout(timer);
  }, [isReplaying, animStep, subgraph.nodes.length]);

  const visibleNodes = subgraph.nodes.slice(0, animStep);
  const visibleHops = subgraph.hops.slice(0, animStep - 1);

  const getHazardPillText = (edge: GraphEdge) => {
    if (!isDungeonMode) return `${edge.weight}`;
    if (edge.hazard === 'fire' || edge.weight === 8) return `🔥 ${edge.weight}`;
    if (edge.hazard === 'ice' || edge.weight === 3) return `🧊 ${edge.weight}`;
    if (edge.hazard === 'monster' || edge.weight === 6) return `👹 ${edge.weight}`;
    if (edge.hazard === 'door' || edge.weight === 2) return `🚪 ${edge.weight}`;
    if (edge.hazard === 'coin' || edge.weight === 1) return `🪙 ${edge.weight}`;
    return `⚡ ${edge.weight}`;
  };

  return (
    <div className="flex flex-col space-y-3 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800 font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            {isDungeonMode ? '🏆' : <Route className="w-3.5 h-3.5" />}
          </div>
          <div>
            <span className="font-semibold text-xs text-zinc-100 block">
              {isDungeonMode ? 'Optimal Dungeon Escape Route' : 'Final Shortest Path Graph'}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {isDungeonMode
                ? `${subgraph.nodes.length} Chambers · ${subgraph.edges.length} Corridors`
                : `Nodes: ${subgraph.nodes.length} | Edges: ${subgraph.edges.length}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
            {isDungeonMode ? `Optimal Cost: ${subgraph.totalDistance}` : `Shortest Cost = ${subgraph.totalDistance}`}
          </span>
          <button
            onClick={handleReplay}
            className="p-1 px-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors text-[10px] flex items-center gap-1 font-mono"
            title="Replay path drawing"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Replay</span>
          </button>
        </div>
      </div>

      {/* Toggle to isolate shortest path on main canvas */}
      <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-lg border border-zinc-800">
        <span className="text-[11px] text-zinc-300 font-medium">
          {isDungeonMode ? 'Show escape route only on canvas:' : 'Show shortest path only on canvas:'}
        </span>
        <button
          onClick={onToggleShowOnlyPath}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
            showOnlyPathOnCanvas
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {showOnlyPathOnCanvas ? 'Active (Path Only)' : 'Show All Rooms'}
        </button>
      </div>

      {/* DEDICATED VISUAL GRAPH (Shortest Path Only) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 overflow-hidden">
        <svg className="w-full h-32">
          <defs>
            <marker
              id="final-arrow"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
          </defs>

          {(() => {
            const width = 360;
            const height = 128;
            const count = subgraph.nodes.length;
            const spacing = count > 1 ? (width - 70) / (count - 1) : 0;
            const startX = 35;
            const centerY = height / 2;

            const coords = subgraph.nodes.map((n, idx) => ({
              ...n,
              cx: startX + idx * spacing,
              cy: centerY,
            }));

            return (
              <g>
                {/* Shortest Path Edges */}
                {visibleHops.map((hop, idx) => {
                  const src = coords[idx];
                  const tgt = coords[idx + 1];
                  const midX = (src.cx + tgt.cx) / 2;
                  const midY = centerY;
                  const pillText = getHazardPillText(hop.edge);
                  const pillWidth = isDungeonMode ? 44 : 24;

                  return (
                    <g key={hop.edge.id}>
                      <line
                        x1={src.cx}
                        y1={src.cy}
                        x2={tgt.cx}
                        y2={tgt.cy}
                        stroke="#10b981"
                        strokeWidth="3.5"
                        markerEnd="url(#final-arrow)"
                      />

                      <g transform={`translate(${midX}, ${midY - 14})`}>
                        <rect
                          x={-pillWidth / 2}
                          y="-9"
                          width={pillWidth}
                          height="18"
                          rx="9"
                          fill="#064e3b"
                          stroke="#10b981"
                          strokeWidth="1.2"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fill="#d1fae5"
                          className="font-mono text-[10px] font-bold"
                        >
                          {pillText}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Shortest Path Nodes */}
                {visibleNodes.map((n, idx) => {
                  const coord = coords[idx];
                  const isFirst = idx === 0;
                  const isLast = idx === subgraph.nodes.length - 1;
                  const icon = n.icon || (isFirst ? '🧙' : isLast ? '💎' : '🚪');

                  return (
                    <g key={n.id} transform={`translate(${coord.cx}, ${coord.cy})`}>
                      <circle
                        r="22"
                        fill="none"
                        stroke={isFirst ? '#10b981' : isLast ? '#eab308' : '#34d399'}
                        strokeWidth="1.5"
                        strokeOpacity="0.5"
                      />
                      <circle
                        r="18"
                        fill={isFirst ? '#064e3b' : isLast ? '#422006' : '#18181b'}
                        stroke={isFirst ? '#10b981' : isLast ? '#eab308' : '#34d399'}
                        strokeWidth="2"
                      />
                      {isDungeonMode ? (
                        <text textAnchor="middle" dy="5.5" fontSize="15" className="pointer-events-none">
                          {icon}
                        </text>
                      ) : (
                        <text
                          textAnchor="middle"
                          dy="4.5"
                          fill="#f4f4f5"
                          className="font-mono text-xs font-bold"
                        >
                          {n.label}
                        </text>
                      )}
                      <text
                        textAnchor="middle"
                        dy="28"
                        fill="#a1a1aa"
                        className="font-mono text-[9px] font-medium"
                      >
                        {isFirst ? (isDungeonMode ? '🧙 Start' : 'Start') : isLast ? (isDungeonMode ? '💎 Goal' : 'Target') : `v${idx}`}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Path sequence hops */}
      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
        {subgraph.hops.map((hop, idx) => {
          const pillText = getHazardPillText(hop.edge);
          return (
            <div
              key={idx}
              className="p-1.5 px-2.5 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">{hop.fromNode.label}</span>
                <span className="text-zinc-600">→</span>
                <span className="text-emerald-400 font-bold">{hop.toNode.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-[11px] font-medium">{pillText}</span>
                <span className="text-zinc-600">|</span>
                <span className="text-indigo-300 text-[11px] font-semibold">∑ {hop.cumulativeDistance}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
