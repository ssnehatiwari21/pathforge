import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GraphNode, GraphEdge, DijkstraResult, DijkstraStep } from '../types/graph';
import { runDijkstra } from '../algorithms/dijkstra';
import { VisualPathGraph } from './VisualPathGraph';
import {
  Edit3,
  Plus,
  Route,
  Sparkles,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  AlertCircle,
  Heart,
  Clock,
  Coins,
  Skull,
  Gamepad2,
  Bot,
  Undo2,
  Trophy,
  Footprints,
  Flame,
} from 'lucide-react';

interface RightPanelProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  isDirected: boolean;
  selectedNodeId: string | null;
  onApplyGraph: (newNodes: GraphNode[], newEdges: GraphEdge[]) => void;
  onAddEdge: (source: string, target: string, weight: number, hazard?: any) => void;
  dijkstraResult: DijkstraResult | null;
  onDijkstraResultChange: (result: DijkstraResult | null) => void;
  onStepChange: (step: DijkstraStep | null) => void;
  showOnlyPathOnCanvas: boolean;
  onToggleShowOnlyPath: () => void;
  isDungeonMode?: boolean;
  // Interactive Play Mode Props
  isPlayMode: boolean;
  onTogglePlayMode: (playMode: boolean) => void;
  playerCurrentNodeId: string;
  onPlayerMove: (targetNodeId: string) => void;
  onResetPlayer: () => void;
  onUndoPlayerMove: () => void;
  playerPathNodeIds: string[];
  playerPathEdgeIds: string[];
  playerHP: number;
  playerTime: number;
  playerCoins: number;
  playerMonsters: number;
  playerLogs: string[];
  playerStatus: 'playing' | 'won' | 'lost';
}

export const RightPanel: React.FC<RightPanelProps> = ({
  nodes,
  edges,
  isDirected,
  selectedNodeId,
  onApplyGraph,
  onAddEdge,
  dijkstraResult,
  onDijkstraResultChange,
  onStepChange,
  showOnlyPathOnCanvas,
  onToggleShowOnlyPath,
  isDungeonMode = false,
  isPlayMode,
  onTogglePlayMode,
  playerCurrentNodeId,
  onPlayerMove,
  onResetPlayer,
  onUndoPlayerMove,
  playerPathNodeIds,
  playerPathEdgeIds,
  playerHP,
  playerTime,
  playerCoins,
  playerMonsters,
  playerLogs,
  playerStatus,
}) => {
  // --- 1. MANUAL EDGE LIST INPUT STATE ---
  const [textInput, setTextInput] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(true);

  useEffect(() => {
    const lines = edges.map((e) => {
      const srcNode = nodes.find((n) => n.id === e.source);
      const tgtNode = nodes.find((n) => n.id === e.target);
      const srcLabel = srcNode ? srcNode.label : e.source;
      const tgtLabel = tgtNode ? tgtNode.label : e.target;
      return `${srcLabel} ${tgtLabel} ${e.weight}`;
    });

    const connectedLabels = new Set<string>();
    edges.forEach((e) => {
      const s = nodes.find((n) => n.id === e.source)?.label;
      const t = nodes.find((n) => n.id === e.target)?.label;
      if (s) connectedLabels.add(s);
      if (t) connectedLabels.add(t);
    });

    const isolatedLines = nodes
      .filter((n) => !connectedLabels.has(n.label))
      .map((n) => n.label);

    setTextInput([...lines, ...isolatedLines].join('\n'));
    setParseError(null);
  }, [edges, nodes]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTextInput(val);

    try {
      const lines = val
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('//'));

      const nodeMap = new Map<string, GraphNode>();
      nodes.forEach((n) => nodeMap.set(n.label, { ...n }));

      const parsedEdges: GraphEdge[] = [];
      let nextEdgeId = 1;
      let angle = 0;
      const radius = 170;
      const centerX = 380;
      const centerY = 280;

      lines.forEach((line) => {
        const tokens = line.split(/[\s,;:->]+/).filter(Boolean);

        if (tokens.length === 1) {
          const label = tokens[0];
          if (!nodeMap.has(label)) {
            const x = Math.round(centerX + radius * Math.cos(angle));
            const y = Math.round(centerY + radius * Math.sin(angle));
            angle += 0.8;
            nodeMap.set(label, { id: label, label, x, y });
          }
        } else if (tokens.length >= 2) {
          const uLabel = tokens[0];
          const vLabel = tokens[1];
          const weight = tokens.length >= 3 ? parseFloat(tokens[2]) || 1 : 1;

          if (!nodeMap.has(uLabel)) {
            const x = Math.round(centerX + radius * Math.cos(angle));
            const y = Math.round(centerY + radius * Math.sin(angle));
            angle += 0.8;
            nodeMap.set(uLabel, { id: uLabel, label: uLabel, x, y });
          }

          if (!nodeMap.has(vLabel)) {
            const x = Math.round(centerX + radius * Math.cos(angle));
            const y = Math.round(centerY + radius * Math.sin(angle));
            angle += 0.8;
            nodeMap.set(vLabel, { id: vLabel, label: vLabel, x, y });
          }

          const uNode = nodeMap.get(uLabel)!;
          const vNode = nodeMap.get(vLabel)!;

          parsedEdges.push({
            id: `edge_${nextEdgeId++}`,
            source: uNode.id,
            target: vNode.id,
            weight,
          });
        }
      });

      setParseError(null);
      onApplyGraph(Array.from(nodeMap.values()), parsedEdges);
    } catch {
      setParseError('Format: Node1 Node2 [weight]');
    }
  };

  // --- 2. QUICK EDGE ADDING FORM ---
  const [quickSrc, setQuickSrc] = useState('');
  const [quickTgt, setQuickTgt] = useState('');
  const [quickWeight, setQuickWeight] = useState('1');
  const [quickTile, setQuickTile] = useState<'fire' | 'ice' | 'monster' | 'door' | 'coin' | 'custom'>('door');

  const handleTileChange = (tile: string) => {
    setQuickTile(tile as any);
    if (tile === 'fire') setQuickWeight('8');
    else if (tile === 'ice') setQuickWeight('3');
    else if (tile === 'monster') setQuickWeight('6');
    else if (tile === 'door') setQuickWeight('2');
    else if (tile === 'coin') setQuickWeight('1');
  };

  const handleQuickAddEdge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSrc.trim() || !quickTgt.trim()) return;
    const w = parseFloat(quickWeight) || 1;
    onAddEdge(quickSrc.trim(), quickTgt.trim(), w, quickTile !== 'custom' ? quickTile : undefined);
    setQuickTgt('');
  };

  // --- 3. DIJKSTRA CONFIG & RUN ---
  const [sourceId, setSourceId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(750);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (nodes.length >= 2) {
      if (isDungeonMode) {
        const heroNode = nodes.find(
          (n) => n.icon === '🧙' || (n.label + ' ' + n.id).toLowerCase().includes('hero')
        );
        const treasureNode = nodes.find(
          (n) => n.icon === '💎' || (n.label + ' ' + n.id).toLowerCase().includes('treasure') || (n.label + ' ' + n.id).toLowerCase().includes('vault')
        );

        if (heroNode) setSourceId(heroNode.id);
        else setSourceId(nodes[0].id);

        if (treasureNode) setTargetId(treasureNode.id);
        else setTargetId(nodes[nodes.length - 1].id);
      } else {
        if (!sourceId || !nodes.find((n) => n.id === sourceId)) {
          setSourceId(nodes[0].id);
        }
        if (!targetId || !nodes.find((n) => n.id === targetId)) {
          setTargetId(nodes[nodes.length - 1].id);
        }
      }
    }
  }, [nodes, isDungeonMode]);

  const handleRunDijkstra = () => {
    if (!sourceId || !targetId) return;
    const res = runDijkstra(nodes, edges, sourceId, targetId, isDirected);
    onDijkstraResultChange(res);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    onStepChange(res.steps[0] || null);
  };

  const goToStep = (idx: number) => {
    if (!dijkstraResult) return;
    const bounded = Math.max(0, Math.min(idx, dijkstraResult.steps.length - 1));
    setCurrentStepIndex(bounded);
    onStepChange(dijkstraResult.steps[bounded]);
  };

  useEffect(() => {
    if (isPlaying && dijkstraResult) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= dijkstraResult.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          onStepChange(dijkstraResult.steps[next]);
          return next;
        });
      }, speedMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, dijkstraResult, speedMs]);

  const currentStep = dijkstraResult?.steps[currentStepIndex];

  // Available adjacent rooms for player
  const playerValidMoves = useMemo(() => {
    if (!playerCurrentNodeId) return [];
    return edges
      .filter((e) => e.source === playerCurrentNodeId || (!isDirected && e.target === playerCurrentNodeId))
      .map((e) => {
        const nextId = e.source === playerCurrentNodeId ? e.target : e.source;
        const nextNode = nodes.find((n) => n.id === nextId);
        return {
          edge: e,
          targetNode: nextNode,
        };
      })
      .filter((m) => m.targetNode !== undefined);
  }, [playerCurrentNodeId, edges, isDirected, nodes]);

  const currentNode = nodes.find((n) => n.id === playerCurrentNodeId);

  return (
    <div className="h-full flex flex-col font-sans select-none overflow-y-auto bg-zinc-950 p-4 space-y-4">
      {/* IN DUNGEON MODE: SUB-MODE SWITCH (Play Yourself vs Dijkstra Solver) */}
      {isDungeonMode && (
        <div className="flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => onTogglePlayMode(true)}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              isPlayMode
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Play Yourself</span>
          </button>
          <button
            onClick={() => onTogglePlayMode(false)}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              !isPlayMode
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Dijkstra AI Solver</span>
          </button>
        </div>
      )}

      {/* HOW TO PLAY COLLAPSIBLE GUIDE (In Dungeon Mode) */}
      {isDungeonMode && (
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden transition-all">
          <button
            onClick={() => setShowHowToPlay(!showHowToPlay)}
            className="w-full p-2.5 px-3.5 flex items-center justify-between text-xs font-semibold text-amber-300 hover:bg-zinc-800/40 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>📜 How to Play (Rules & Hazards)</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {showHowToPlay ? '▲ Hide Guide' : '▼ View Guide'}
            </span>
          </button>

          {showHowToPlay && (
            <div className="p-3.5 pt-0 space-y-2.5 text-xs border-t border-zinc-800/60 bg-zinc-950/60">
              {/* Objective */}
              <div className="space-y-0.5">
                <span className="text-zinc-200 font-semibold text-[11px] block">🎯 Objective</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Guide your <strong className="text-emerald-400">🧙 Hero</strong> from the entrance chamber to the <strong className="text-yellow-400">💎 Treasure Vault</strong> while conserving <strong className="text-rose-400">❤️ Health (HP)</strong> and minimizing <strong className="text-sky-400">⏱ Travel Time</strong>!
                </p>
              </div>

              {/* Controls */}
              <div className="space-y-0.5">
                <span className="text-zinc-200 font-semibold text-[11px] block">🕹️ How to Move</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Click on any flashing green room marked <strong className="text-emerald-300">MOVE ➡️</strong> directly on the canvas, or click the corridor buttons in the sidebar. Use <strong className="text-zinc-300">Undo</strong> to step back or <strong className="text-zinc-300">Restart</strong> to try another route.
                </p>
              </div>

              {/* Hazards Table */}
              <div className="space-y-1">
                <span className="text-zinc-200 font-semibold text-[11px] block">⚠️ Hazards & Room Costs</span>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                  <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <span>🚪 Door:</span>
                    <span className="text-emerald-400 font-bold">2s · 0 HP</span>
                  </div>
                  <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <span>🧊 Ice:</span>
                    <span className="text-sky-300 font-bold">3s · -4 HP</span>
                  </div>
                  <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <span>👹 Monster:</span>
                    <span className="text-orange-400 font-bold">6s · -15 HP</span>
                  </div>
                  <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <span>🔥 Fire:</span>
                    <span className="text-rose-400 font-bold">8s · -12 HP</span>
                  </div>
                  <div className="col-span-2 p-1.5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <span>🪙 Coin Vault:</span>
                    <span className="text-yellow-400 font-bold">1s · +10 🪙 Reward!</span>
                  </div>
                </div>
              </div>

              {/* AI Comparison note */}
              <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-[10px] text-indigo-200 leading-relaxed">
                🤖 <strong>AI Comparison:</strong> Once you reach the treasure, click <em>"Compare with Dijkstra AI"</em> to see if your route was mathematically the shortest!
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- PLAY MODE VIEW --- */}
      {isDungeonMode && isPlayMode ? (
        <div className="space-y-3.5">
          {/* Player Live Stats Card */}
          <div className="bg-amber-950/20 border border-amber-600/30 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-amber-200 flex items-center gap-1.5">
                  <span>🧙 Your Hero Stats</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Current Room: <strong className="text-zinc-200">{currentNode?.label || 'Entrance'}</strong>
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={onUndoPlayerMove}
                  disabled={playerPathNodeIds.length <= 1}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 text-[10px] font-mono flex items-center gap-1"
                  title="Undo move"
                >
                  <Undo2 className="w-3 h-3" />
                  <span>Undo</span>
                </button>
                <button
                  onClick={onResetPlayer}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono flex items-center gap-1"
                  title="Reset hero to start"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restart</span>
                </button>
              </div>
            </div>

            {/* HP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Health</span>
                </span>
                <span className={`font-bold ${playerHP > 50 ? 'text-emerald-400' : playerHP > 25 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {playerHP} / 100 HP
                </span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    playerHP > 50 ? 'bg-emerald-500' : playerHP > 25 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.max(0, playerHP)}%` }}
                />
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                <div className="flex items-center justify-center gap-1 text-sky-400 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{playerTime}</span>
                </div>
                <span className="text-[9px] text-zinc-400 block">⏱ Travel Time</span>
              </div>
              <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                <div className="flex items-center justify-center gap-1 text-yellow-400 text-xs font-bold">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{playerCoins}</span>
                </div>
                <span className="text-[9px] text-zinc-400 block">🪙 Coins</span>
              </div>
              <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                <div className="flex items-center justify-center gap-1 text-orange-400 text-xs font-bold">
                  <Skull className="w-3.5 h-3.5" />
                  <span>{playerMonsters}</span>
                </div>
                <span className="text-[9px] text-zinc-400 block">👹 Enemies</span>
              </div>
            </div>
          </div>

          {/* GAME OVER CARD (Won or Lost) */}
          {playerStatus === 'won' && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2.5 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-xl">
                🏆
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-300">TREASURE ESCAPED! YOU WON!</h4>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  You successfully reached the 💎 Treasure Vault with <strong>{playerHP} HP</strong> remaining in <strong>{playerTime}</strong> time!
                </p>
              </div>

              {/* Compare with Dijkstra Button */}
              <button
                onClick={() => {
                  onTogglePlayMode(false);
                  handleRunDijkstra();
                }}
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Compare Your Route with Dijkstra AI 🤖</span>
              </button>
            </div>
          )}

          {playerStatus === 'lost' && (
            <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl space-y-2.5 text-center">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center mx-auto text-xl">
                💀
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-300">YOU PERISHED IN THE DUNGEON!</h4>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  The hazardous traps depleted all your HP. Try another path or check Dijkstra's safe route!
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onResetPlayer}
                  className="flex-1 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    onTogglePlayMode(false);
                    handleRunDijkstra();
                  }}
                  className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                >
                  See AI Route 🤖
                </button>
              </div>
            </div>
          )}

          {/* AVAILABLE NEXT CORRIDORS (When playing) */}
          {playerStatus === 'playing' && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-2.5">
              <span className="font-semibold text-xs text-zinc-200 flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-emerald-400" />
                <span>Available Corridors from {currentNode?.label}:</span>
              </span>

              {playerValidMoves.length === 0 ? (
                <div className="text-xs text-zinc-500 italic p-2 bg-zinc-950 rounded-lg text-center">
                  Dead end! No outgoing corridors from this room.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {playerValidMoves.map(({ edge, targetNode }) => {
                    const hazard = edge.hazard;
                    const hazardLabel =
                      hazard === 'fire' || edge.weight === 8
                        ? '🔥 Fire Trap (-12 HP, 8s)'
                        : hazard === 'monster' || edge.weight === 6
                        ? '👹 Monster Fight (-15 HP, 6s)'
                        : hazard === 'ice' || edge.weight === 3
                        ? '🧊 Ice Patch (-4 HP, 3s)'
                        : hazard === 'door' || edge.weight === 2
                        ? '🚪 Locked Door (2s)'
                        : hazard === 'coin' || edge.weight === 1
                        ? '🪙 Coins Reward (+10 🪙, 1s)'
                        : `Cost ${edge.weight}`;

                    return (
                      <button
                        key={edge.id}
                        onClick={() => onPlayerMove(targetNode!.id)}
                        className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-emerald-500/60 hover:bg-emerald-950/20 text-left flex items-center justify-between text-xs font-mono transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-100 font-bold group-hover:text-emerald-300">
                            ➡️ {targetNode!.label}
                          </span>
                        </div>
                        <span className="text-amber-400 text-[11px] font-medium">
                          {hazardLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PLAYER JOURNEY LOG */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-medium block">
              Hero Journey Log
            </span>
            <div className="space-y-1 text-xs font-mono text-zinc-300">
              {playerLogs.map((log, idx) => (
                <div key={idx} className="p-1 rounded bg-zinc-950/80 text-[11px] leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* --- DIJKSTRA SOLVER & GRAPH EDITOR VIEW --- */
        <>
          {/* 1. MANUAL EDGE LIST INPUT */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="font-semibold text-xs flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isDungeonMode ? 'Dungeon Corridors List' : 'Manual Edge List Input'}</span>
              </span>
              <span className="font-mono text-[10px] text-zinc-400">Format: u v weight</span>
            </div>

            <textarea
              value={textInput}
              onChange={handleTextChange}
              placeholder={"A B 4\nB C 2\nA C 7"}
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-xs text-zinc-200 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-zinc-700 transition-colors"
              rows={4}
              spellCheck={false}
            />

            {parseError && (
              <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}
          </div>

          {/* 2. QUICK EDGE ADDING FORM */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3.5 space-y-2">
            <span className="font-semibold text-xs text-zinc-300 block">
              {isDungeonMode ? 'Quick Corridor / Hazard Adding' : 'Quick Edge Adding'}
            </span>

            {isDungeonMode && (
              <div className="flex items-center gap-2 mb-1 text-xs">
                <span className="text-[11px] text-zinc-400 font-medium">Tile:</span>
                <select
                  aria-label="Dungeon Tile Hazard"
                  value={quickTile}
                  onChange={(e) => handleTileChange(e.target.value)}
                  className="flex-1 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-md font-mono text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="door">🚪 Door (Cost 2)</option>
                  <option value="ice">🧊 Ice (Cost 3)</option>
                  <option value="monster">👹 Monster (Cost 6)</option>
                  <option value="fire">🔥 Fire (Cost 8)</option>
                  <option value="coin">🪙 Coins (Cost 1 reward)</option>
                  <option value="custom">⚡ Custom Cost</option>
                </select>
              </div>
            )}

            <form onSubmit={handleQuickAddEdge} className="grid grid-cols-7 gap-1.5 items-center">
              <input
                type="text"
                placeholder="From"
                value={quickSrc}
                onChange={(e) => setQuickSrc(e.target.value)}
                className="col-span-2 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="col-span-1 text-center text-zinc-500">→</span>
              <input
                type="text"
                placeholder="To"
                value={quickTgt}
                onChange={(e) => setQuickTgt(e.target.value)}
                className="col-span-2 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="Cost"
                value={quickWeight}
                onChange={(e) => setQuickWeight(e.target.value)}
                className="col-span-2 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className={`col-span-7 mt-1 py-1.5 px-3 rounded-md font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm text-white ${
                  isDungeonMode ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isDungeonMode ? 'Add Corridor' : 'Add Edge'}</span>
              </button>
            </form>
          </div>

          {/* 3. SHORTEST PATH ENDPOINTS & RUN DIJKSTRA BUTTON */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3">
            <div>
              <span className="font-semibold text-xs text-zinc-100 flex items-center gap-1.5">
                <Route className="w-4 h-4 text-emerald-400" />
                <span>
                  {isDungeonMode ? 'Find Escape Route to 💎 Treasure' : 'Calculate Shortest Path (Dijkstra)'}
                </span>
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {isDungeonMode
                  ? 'Find the safest optimal corridor from the 🧙 Hero to the 💎 Treasure Vault.'
                  : 'Choose start and destination nodes to compute the optimal route.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 block font-medium">
                  {isDungeonMode ? '🧙 Start Room' : 'Start Node'}
                </label>
                <select
                  aria-label="Start Node"
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 block font-medium">
                  {isDungeonMode ? '💎 Goal Room' : 'End Node'}
                </label>
                <select
                  aria-label="End Node"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* RUN DIJKSTRA BUTTON */}
            <button
              onClick={handleRunDijkstra}
              disabled={nodes.length < 2 || !sourceId || !targetId}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isDungeonMode ? 'Find Escape Route (Dijkstra)' : 'Run Dijkstra Algorithm'}</span>
            </button>
          </div>

          {/* 4. ANIMATION STEP PLAYER */}
          {dijkstraResult && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-zinc-200">
                  {isDungeonMode ? '🧙 Hero Journey Step Player' : 'Animation Step Player'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-emerald-300 border border-zinc-700">
                  Step {currentStepIndex + 1} / {dijkstraResult.steps.length}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max={dijkstraResult.steps.length - 1}
                value={currentStepIndex}
                onChange={(e) => goToStep(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => goToStep(0)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  title="First step"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => goToStep(currentStepIndex - 1)}
                  disabled={currentStepIndex === 0}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause' : isDungeonMode ? 'Walk Hero' : 'Play'}</span>
                </button>
                <button
                  onClick={() => goToStep(currentStepIndex + 1)}
                  disabled={currentStepIndex === dijkstraResult.steps.length - 1}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              {currentStep && (
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 font-mono leading-relaxed">
                  <span className="text-emerald-400 font-semibold mr-1">[{currentStep.type.toUpperCase()}]:</span>
                  {currentStep.description}
                </div>
              )}
            </div>
          )}

          {/* 5. FINAL GRAPH WITH SHORTEST PATH ONLY */}
          <VisualPathGraph
            nodes={nodes}
            edges={edges}
            dijkstraResult={dijkstraResult}
            showOnlyPathOnCanvas={showOnlyPathOnCanvas}
            onToggleShowOnlyPath={onToggleShowOnlyPath}
            isDungeonMode={isDungeonMode}
          />
        </>
      )}
    </div>
  );
};
