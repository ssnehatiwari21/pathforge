import React, { useState, useRef, useCallback } from 'react';
import { GraphNode, GraphEdge } from '../types/graph';
import { X, Footprints } from 'lucide-react';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  isDirected: boolean;
  onUpdateNodes: (nodes: GraphNode[]) => void;
  onAddNode: (x: number, y: number) => void;
  onAddEdge: (source: string, target: string, weight: number) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onUpdateEdgeWeight: (edgeId: string, weight: number) => void;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  activeDijkstraNodeId?: string | null;
  visitedNodeIds?: string[];
  pathNodeIds?: string[];
  pathEdgeIds?: string[];
  activeDijkstraEdgeId?: string | null;
  dijkstraDistances?: Record<string, number>;
  showPathOnly?: boolean;
  isDungeonMode?: boolean;
  // Play Mode props
  isPlayMode?: boolean;
  playerCurrentNodeId?: string;
  onPlayerMove?: (targetNodeId: string) => void;
  playerPathNodeIds?: string[];
  playerPathEdgeIds?: string[];
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  isDirected,
  onUpdateNodes,
  onAddNode,
  onAddEdge,
  onDeleteNode,
  onDeleteEdge,
  onUpdateEdgeWeight,
  selectedNodeId,
  onSelectNode,
  activeDijkstraNodeId = null,
  visitedNodeIds = [],
  pathNodeIds = [],
  pathEdgeIds = [],
  activeDijkstraEdgeId = null,
  dijkstraDistances,
  showPathOnly = false,
  isDungeonMode = false,
  isPlayMode = false,
  playerCurrentNodeId,
  onPlayerMove,
  playerPathNodeIds = [],
  playerPathEdgeIds = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging state (fixed 1:1 scale, NO zooming)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Edge drawing state
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Inline Weight Edit Modal
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [editingWeightVal, setEditingWeightVal] = useState<string>('1');

  const clientToWorld = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.round(clientX - rect.left),
      y: Math.round(clientY - rect.top),
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const world = clientToWorld(e.clientX, e.clientY);
    setMousePos(world);

    if (draggingNodeId) {
      onUpdateNodes(
        nodes.map((n) =>
          n.id === draggingNodeId ? { ...n, x: world.x, y: world.y } : n
        )
      );
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Find valid adjacent rooms in Play Mode
  const validNextRoomIds = React.useMemo(() => {
    if (!isDungeonMode || !isPlayMode || !playerCurrentNodeId) return [];
    return edges
      .filter((e) => e.source === playerCurrentNodeId || (!isDirected && e.target === playerCurrentNodeId))
      .map((e) => (e.source === playerCurrentNodeId ? e.target : e.source));
  }, [isDungeonMode, isPlayMode, playerCurrentNodeId, edges, isDirected]);

  const handleNodeMouseDown = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();

    // In Play Mode, clicking a valid adjacent room moves the player!
    if (isDungeonMode && isPlayMode && validNextRoomIds.includes(node.id)) {
      onPlayerMove?.(node.id);
      return;
    }

    if (e.button === 2) {
      onDeleteNode(node.id);
      return;
    }

    if (e.altKey || e.ctrlKey || e.shiftKey) {
      setConnectingSourceId(node.id);
      return;
    }

    onSelectNode(node.id);
    setDraggingNodeId(node.id);
  };

  const handleNodeMouseUp = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    if (connectingSourceId && connectingSourceId !== node.id) {
      onAddEdge(connectingSourceId, node.id, 1);
      setConnectingSourceId(null);
    } else {
      setConnectingSourceId(null);
    }
    setDraggingNodeId(null);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      const world = clientToWorld(e.clientX, e.clientY);
      onAddNode(world.x, world.y);
    }
  };

  const getHazardPillText = (edge: GraphEdge) => {
    if (!isDungeonMode) return `${edge.weight}`;
    if (edge.hazard === 'fire' || edge.weight === 8) return `🔥 ${edge.weight}`;
    if (edge.hazard === 'ice' || edge.weight === 3) return `🧊 ${edge.weight}`;
    if (edge.hazard === 'monster' || edge.weight === 6) return `👹 ${edge.weight}`;
    if (edge.hazard === 'door' || edge.weight === 2) return `🚪 ${edge.weight}`;
    if (edge.hazard === 'coin' || edge.weight === 1) return `🪙 ${edge.weight}`;
    return `⚡ ${edge.weight}`;
  };

  const getNodeDisplay = (node: GraphNode) => {
    if (!isDungeonMode) {
      return { icon: null, text: node.label };
    }
    if (node.icon) return { icon: node.icon, text: node.label.replace(node.icon, '').trim() };
    const lower = (node.label + ' ' + node.id).toLowerCase();
    if (lower.includes('hero') || lower.includes('start') || lower.includes('wizard')) return { icon: '🧙', text: 'Hero' };
    if (lower.includes('treasure') || lower.includes('gold') || lower.includes('vault') || lower.includes('end')) return { icon: '💎', text: 'Treasure' };
    if (lower.includes('castle') || lower.includes('keep')) return { icon: '🏰', text: 'Castle' };
    if (lower.includes('monster') || lower.includes('lair') || lower.includes('boss')) return { icon: '👹', text: 'Lair' };
    if (lower.includes('gate') || lower.includes('door')) return { icon: '🚪', text: 'Gates' };
    if (lower.includes('cave') || lower.includes('cavern')) return { icon: '🪨', text: 'Cavern' };
    return { icon: '🏠', text: node.label };
  };

  const isFilteringPath = showPathOnly && pathNodeIds.length > 0;
  const renderedNodes = isFilteringPath
    ? nodes.filter((n) => pathNodeIds.includes(n.id))
    : nodes;
  const renderedEdges = isFilteringPath
    ? edges.filter((e) => pathEdgeIds.includes(e.id))
    : edges;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative flex-1 h-full w-full overflow-hidden cursor-crosshair select-none ${
        isDungeonMode ? 'bg-[#0b0c10] bg-dot-grid-dense' : 'bg-zinc-950 bg-dot-grid'
      }`}
    >
      {/* Hint Bar (Top of canvas) */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2 pointer-events-none text-[11px] font-mono bg-zinc-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-zinc-800 shadow-md">
        {isDungeonMode ? (
          isPlayMode ? (
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5" />
                PLAYING:
              </span>
              <span>Click on any pulsing green room ➡️ to move your hero 🧙</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-zinc-300">
              <span className="text-amber-400 font-semibold">Dungeon Hazards:</span>
              <span>🔥 8 (Fire)</span>
              <span className="text-zinc-600">·</span>
              <span>🧊 3 (Ice)</span>
              <span className="text-zinc-600">·</span>
              <span>👹 6 (Monster)</span>
              <span className="text-zinc-600">·</span>
              <span>🚪 2 (Door)</span>
              <span className="text-zinc-600">·</span>
              <span className="text-yellow-400">🪙 reward</span>
              <span className="text-zinc-600">·</span>
              <span className="text-cyan-400 font-bold">💎 treasure</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="text-zinc-200">Double-click:</span> Add Node
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-200">Drag:</span> Move Node
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-200">Alt/Ctrl+Drag:</span> Connect Edge
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-200">Double-click Pill:</span> Edit Weight
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-200">Right-click:</span> Delete
          </div>
        )}
      </div>

      <svg className="w-full h-full pointer-events-auto">
        <defs>
          <marker
            id="arrow-default"
            viewBox="0 0 10 10"
            refX="26"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={isDungeonMode ? '#78716c' : '#71717a'} />
          </marker>
          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="26"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
          </marker>
          <marker
            id="arrow-path"
            viewBox="0 0 10 10"
            refX="26"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
          </marker>
          <marker
            id="arrow-player"
            viewBox="0 0 10 10"
            refX="26"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
          </marker>
        </defs>

        <g>
          {/* EDGES LAYER */}
          {renderedEdges.map((edge) => {
            const src = nodes.find((n) => n.id === edge.source);
            const tgt = nodes.find((n) => n.id === edge.target);
            if (!src || !tgt) return null;

            const isPathEdge = pathEdgeIds.includes(edge.id);
            const isPlayerTraversed = isPlayMode && playerPathEdgeIds.includes(edge.id);
            const isActiveDijkstra = activeDijkstraEdgeId === edge.id;

            const hasOpposite = isDirected && edges.some((e) => e.source === tgt.id && e.target === src.id);

            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const dist = Math.hypot(dx, dy) || 1;

            let pathD = '';
            let midX = (src.x + tgt.x) / 2;
            let midY = (src.y + tgt.y) / 2;

            if (src.id === tgt.id) {
              pathD = `M ${src.x - 10} ${src.y - 20} C ${src.x - 40} ${src.y - 80}, ${src.x + 40} ${src.y - 80}, ${src.x + 10} ${src.y - 20}`;
              midX = src.x;
              midY = src.y - 65;
            } else if (hasOpposite) {
              const normalX = -dy / dist;
              const normalY = dx / dist;
              const curve = 28;
              const cx = (src.x + tgt.x) / 2 + normalX * curve;
              const cy = (src.y + tgt.y) / 2 + normalY * curve;
              pathD = `M ${src.x} ${src.y} Q ${cx} ${cy} ${tgt.x} ${tgt.y}`;
              midX = cx;
              midY = cy;
            } else {
              pathD = `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
            }

            let strokeColor = isDungeonMode ? '#44403c' : '#3f3f46';
            let strokeWidth = 1.8;
            let markerId = 'url(#arrow-default)';

            if (isPlayerTraversed) {
              strokeColor = '#3b82f6'; // Blue player path
              strokeWidth = 4;
              markerId = 'url(#arrow-player)';
            } else if (isPathEdge) {
              strokeColor = '#10b981'; // Green Dijkstra path
              strokeWidth = 4;
              markerId = 'url(#arrow-path)';
            } else if (isActiveDijkstra) {
              strokeColor = '#f59e0b';
              strokeWidth = 3;
              markerId = 'url(#arrow-active)';
            }

            const pillText = getHazardPillText(edge);
            const pillWidth = isDungeonMode ? 44 : 28;

            return (
              <g key={edge.id} className="cursor-pointer group">
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                  onContextMenu={(e) => {
                    e.stopPropagation();
                    onDeleteEdge(edge.id);
                  }}
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isActiveDijkstra ? '6,4' : undefined}
                  markerEnd={isDirected ? markerId : undefined}
                  className="transition-all duration-200"
                />

                {/* Weight Chip */}
                <g
                  transform={`translate(${midX}, ${midY})`}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingEdgeId(edge.id);
                    setEditingWeightVal(String(edge.weight));
                  }}
                  onContextMenu={(e) => {
                    e.stopPropagation();
                    onDeleteEdge(edge.id);
                  }}
                  className="cursor-pointer"
                >
                  <rect
                    x={-pillWidth / 2}
                    y="-10"
                    width={pillWidth}
                    height="20"
                    rx="10"
                    className={`transition-colors ${
                      isPlayerTraversed
                        ? 'fill-blue-950 stroke-blue-500'
                        : isPathEdge
                        ? 'fill-emerald-950 stroke-emerald-500'
                        : isActiveDijkstra
                        ? 'fill-amber-900 stroke-amber-400'
                        : isDungeonMode
                        ? 'fill-stone-900 stroke-stone-700 group-hover:stroke-stone-500'
                        : 'fill-zinc-900 stroke-zinc-700 group-hover:stroke-zinc-500'
                    }`}
                    strokeWidth="1.2"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    className={`font-mono text-[11px] font-semibold pointer-events-none ${
                      isPlayerTraversed
                        ? 'fill-blue-200'
                        : isPathEdge
                        ? 'fill-emerald-200'
                        : isActiveDijkstra
                        ? 'fill-amber-200'
                        : 'fill-zinc-300'
                    }`}
                  >
                    {pillText}
                  </text>
                </g>
              </g>
            );
          })}

          {/* DRAGGING CONNECTION PREVIEW LINE */}
          {connectingSourceId && (() => {
            const src = nodes.find((n) => n.id === connectingSourceId);
            if (!src) return null;
            return (
              <line
                x1={src.x}
                y1={src.y}
                x2={mousePos.x}
                y2={mousePos.y}
                stroke={isDungeonMode ? '#f59e0b' : '#818cf8'}
                strokeWidth="2"
                strokeDasharray="4,4"
              />
            );
          })()}

          {/* NODES LAYER */}
          {renderedNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isDijkstraActive = activeDijkstraNodeId === node.id;
            const isVisited = visitedNodeIds.includes(node.id);
            const isPathNode = pathNodeIds.includes(node.id);

            // Play mode check
            const isPlayerHere = isPlayMode && playerCurrentNodeId === node.id;
            const isClickableNextRoom = isPlayMode && validNextRoomIds.includes(node.id);
            const isPlayerVisited = isPlayMode && playerPathNodeIds.includes(node.id);

            const display = getNodeDisplay(node);
            const isHeroRoom = display.icon === '🧙';
            const isTreasureRoom = display.icon === '💎';

            let nodeFill = isDungeonMode ? '#1c1917' : '#18181b';
            let nodeStroke = isDungeonMode ? '#44403c' : '#3f3f46';
            let textColor = '#f4f4f5';

            if (isPlayerHere) {
              nodeFill = '#1e3a8a'; // Blue for player
              nodeStroke = '#60a5fa';
              textColor = '#dbeafe';
            } else if (isClickableNextRoom) {
              nodeFill = '#064e3b';
              nodeStroke = '#34d399';
              textColor = '#a7f3d0';
            } else if (isPathNode) {
              nodeFill = '#064e3b';
              nodeStroke = '#10b981';
              textColor = '#d1fae5';
            } else if (isDijkstraActive) {
              nodeFill = '#451a03';
              nodeStroke = '#f59e0b';
              textColor = '#fef3c7';
            } else if (isVisited || isPlayerVisited) {
              nodeFill = '#14532d';
              nodeStroke = '#22c55e';
              textColor = '#dcfce7';
            } else if (isSelected) {
              nodeFill = '#292524';
              nodeStroke = '#a8a29e';
            } else if (isDungeonMode) {
              if (isHeroRoom) nodeStroke = '#10b981';
              else if (isTreasureRoom) nodeStroke = '#eab308';
            }

            const dist = dijkstraDistances ? dijkstraDistances[node.id] : undefined;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onMouseUp={(e) => handleNodeMouseUp(e, node)}
                className={`select-none ${
                  isClickableNextRoom
                    ? 'cursor-pointer animate-pulse'
                    : 'cursor-grab active:cursor-grabbing'
                }`}
              >
                {/* Glow ring */}
                {(isPlayerHere || isClickableNextRoom || isPathNode || isDijkstraActive || isSelected || (isDungeonMode && (isHeroRoom || isTreasureRoom))) && (
                  <circle
                    r="30"
                    fill="none"
                    stroke={
                      isPlayerHere
                        ? '#60a5fa'
                        : isClickableNextRoom
                        ? '#34d399'
                        : isDijkstraActive
                        ? '#f59e0b'
                        : isPathNode
                        ? '#10b981'
                        : isTreasureRoom
                        ? '#eab308'
                        : isHeroRoom
                        ? '#10b981'
                        : '#71717a'
                    }
                    strokeWidth={isClickableNextRoom ? '2.5' : '1.5'}
                    strokeDasharray={isClickableNextRoom ? '4,3' : undefined}
                    strokeOpacity="0.8"
                    className={isClickableNextRoom ? 'animate-spin' : isDijkstraActive ? 'animate-pulse' : ''}
                  />
                )}

                {/* Node Body */}
                <circle
                  r="23"
                  fill={nodeFill}
                  stroke={nodeStroke}
                  strokeWidth="2.4"
                  className="transition-colors duration-150 shadow-md"
                />

                {/* In Dungeon Mode: Show Room Icon/Emoji */}
                {isDungeonMode && display.icon ? (
                  <>
                    <text
                      textAnchor="middle"
                      dy="6"
                      fontSize="18"
                      className="pointer-events-none"
                    >
                      {isPlayerHere ? '🧙' : isDijkstraActive ? '🧙' : display.icon}
                    </text>
                    <text
                      textAnchor="middle"
                      dy="36"
                      fill="#d6d3d1"
                      className="font-mono text-[10px] font-semibold pointer-events-none drop-shadow"
                    >
                      {display.text}
                    </text>
                  </>
                ) : (
                  <text
                    textAnchor="middle"
                    dy="5"
                    fill={textColor}
                    className="font-mono text-sm font-bold pointer-events-none"
                  >
                    {node.label}
                  </text>
                )}

                {/* Interactive Click to Move indicator badge for player */}
                {isClickableNextRoom && (
                  <g transform="translate(0, -32)">
                    <rect
                      x="-22"
                      y="-8"
                      width="44"
                      height="16"
                      rx="8"
                      fill="#064e3b"
                      stroke="#34d399"
                      strokeWidth="1.2"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#a7f3d0"
                      className="font-mono text-[9px] font-bold pointer-events-none"
                    >
                      MOVE ➡️
                    </text>
                  </g>
                )}

                {/* Hero Avatar Badge when active node in animation or player here */}
                {isDungeonMode && isPlayerHere && (
                  <g transform="translate(16, -18)">
                    <circle r="10" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
                    <text x="0" y="3.5" textAnchor="middle" fontSize="11" className="pointer-events-none">
                      🧙
                    </text>
                  </g>
                )}

                {/* Dijkstra Distance / Cost Badge */}
                {dist !== undefined && dist !== Infinity && (
                  <g transform={`translate(${isDungeonMode ? 16 : 14}, ${isDungeonMode ? -16 : -14})`}>
                    <rect
                      x="-8"
                      y="-7"
                      width="20"
                      height="14"
                      rx="4"
                      fill="#09090b"
                      stroke="#10b981"
                      strokeWidth="1"
                    />
                    <text
                      x="2"
                      y="3"
                      textAnchor="middle"
                      fill="#34d399"
                      className="font-mono text-[9px] font-bold pointer-events-none"
                    >
                      {dist}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* INLINE WEIGHT EDIT MODAL */}
      {editingEdgeId && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl w-72 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-zinc-200">
                {isDungeonMode ? 'Edit Hazard Cost' : 'Edit Edge Weight'}
              </span>
              <button
                onClick={() => setEditingEdgeId(null)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1"
                value={editingWeightVal}
                onChange={(e) => setEditingWeightVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseFloat(editingWeightVal);
                    if (!isNaN(val)) onUpdateEdgeWeight(editingEdgeId, val);
                    setEditingEdgeId(null);
                  }
                }}
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
              <button
                onClick={() => {
                  const val = parseFloat(editingWeightVal);
                  if (!isNaN(val)) onUpdateEdgeWeight(editingEdgeId, val);
                  setEditingEdgeId(null);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
