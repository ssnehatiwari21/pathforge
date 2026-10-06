import React from 'react';
import { GraphNode, GraphEdge, DijkstraResult } from '../types/graph';
import {
  RotateCcw,
  Undo2,
  Sparkles,
  Trophy,
  Dices,
  Footprints,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Star,
  Skull,
  Coins,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface DungeonGamePanelProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  playerCurrentNodeId: string;
  playerPathNodeIds: string[];
  playerPathEdgeIds: string[];
  playerScore: number;
  playerCost: number;
  playerMonsters: number;
  playerCoins: number;
  playerStatus: 'playing' | 'won';
  playerLogs: string[];
  dijkstraResult: DijkstraResult | null;
  onPlayerMove: (targetNodeId: string) => void;
  onUndoMove: () => void;
  onResetRun: () => void;
  onGenerateNewDungeon: () => void;
  showDijkstraOverlay: boolean;
  onToggleDijkstraOverlay: () => void;
}

export const DungeonGamePanel: React.FC<DungeonGamePanelProps> = ({
  nodes,
  edges,
  playerCurrentNodeId,
  playerPathNodeIds,
  playerScore,
  playerCost,
  playerMonsters,
  playerCoins,
  playerStatus,
  playerLogs,
  dijkstraResult,
  onPlayerMove,
  onUndoMove,
  onResetRun,
  onGenerateNewDungeon,
  showDijkstraOverlay,
  onToggleDijkstraOverlay,
}) => {
  const currentNode = nodes.find((n) => n.id === playerCurrentNodeId);

  // Available adjacent rooms for player
  const validMoves = edges
    .filter((e) => e.source === playerCurrentNodeId)
    .map((e) => {
      const nextNode = nodes.find((n) => n.id === e.target);
      return { edge: e, targetNode: nextNode };
    })
    .filter((m) => m.targetNode !== undefined);

  // Check if player path matched Dijkstra
  const isOptimalMatch = React.useMemo(() => {
    if (!dijkstraResult || playerStatus !== 'won') return false;
    // Compare path cost or exact sequence
    return playerCost === dijkstraResult.totalDistance;
  }, [dijkstraResult, playerStatus, playerCost]);

  // Dijkstra optimal score for comparison
  const dijkstraOptimalScore = React.useMemo(() => {
    if (!dijkstraResult) return 1000;
    let cost = dijkstraResult.totalDistance;
    let monsters = 0;
    let coins = 0;
    dijkstraResult.pathEdgeIds.forEach((eId) => {
      const e = edges.find((x) => x.id === eId);
      if (e?.hazard === 'monster' || e?.weight === 6) monsters++;
      if (e?.hazard === 'coin' || e?.weight === 1) coins++;
    });
    return Math.max(0, 1000 - cost * 25 - monsters * 40 + coins * 60);
  }, [dijkstraResult, edges]);

  return (
    <div className="h-full flex flex-col font-sans select-none overflow-y-auto bg-zinc-950 p-4 space-y-4">
      {/* 1. TOP GAME ACTIONS */}
      <div className="flex items-center gap-2">
        <button
          onClick={onGenerateNewDungeon}
          className="flex-1 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
        >
          <Dices className="w-4 h-4" />
          <span>New Random Dungeon</span>
        </button>

        <button
          onClick={onUndoMove}
          disabled={playerPathNodeIds.length <= 1 || playerStatus === 'won'}
          className="py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 text-xs font-medium flex items-center gap-1 transition-colors"
          title="Undo last move"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>

        <button
          onClick={onResetRun}
          className="py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1 transition-colors"
          title="Restart run from entrance"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {/* 2. POINTS & GAME SCORE DASHBOARD */}
      <div className="bg-amber-950/20 border border-amber-600/30 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs text-amber-200">Dungeon Run Score</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            Room: <strong className="text-zinc-200">{currentNode?.label || 'Entrance'}</strong>
          </span>
        </div>

        {/* Big Score Counter */}
        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-mono block">Current Points</span>
            <span className="text-xl font-mono font-extrabold text-amber-400">
              {playerScore} <span className="text-xs font-normal text-zinc-400">pts</span>
            </span>
          </div>

          <div className="text-right text-[11px] font-mono space-y-0.5">
            <span className="text-zinc-400 block">Base: 1000 pts</span>
            <span className="text-rose-400 block">Path Cost: -{playerCost * 25}</span>
            {playerMonsters > 0 && (
              <span className="text-orange-400 block">Monster Reductions: -{playerMonsters * 40}</span>
            )}
            {playerCoins > 0 && (
              <span className="text-yellow-400 block">Coin Bonuses: +{playerCoins * 60}</span>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-center gap-1 text-sky-400 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{playerCost}</span>
            </div>
            <span className="text-[9px] text-zinc-400 block">Path Cost</span>
          </div>

          <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-center gap-1 text-orange-400 text-xs font-bold">
              <Skull className="w-3.5 h-3.5" />
              <span>{playerMonsters}</span>
            </div>
            <span className="text-[9px] text-zinc-400 block">👹 Monsters</span>
          </div>

          <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-center gap-1 text-yellow-400 text-xs font-bold">
              <Coins className="w-3.5 h-3.5" />
              <span>{playerCoins}</span>
            </div>
            <span className="text-[9px] text-zinc-400 block">🪙 Coins</span>
          </div>
        </div>
      </div>

      {/* 3. VICTORY & DIJKSTRA MATCH COMPARISON CARD */}
      {playerStatus === 'won' && (
        <div
          className={`p-4 rounded-xl border space-y-3 text-center shadow-xl ${
            isOptimalMatch
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
              : 'bg-amber-950/40 border-amber-500/50 text-amber-100'
          }`}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto text-xl bg-zinc-950 border border-zinc-800 shadow-md">
            {isOptimalMatch ? '🌟' : '🏁'}
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
              {isOptimalMatch ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">PERFECT RUN! MATCHED DIJKSTRA!</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300">TREASURE REACHED (SUB-OPTIMAL)</span>
                </>
              )}
            </div>

            <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
              {isOptimalMatch
                ? 'Incredible! Your human choice MATCHED the mathematically optimal shortest path found by Dijkstra’s algorithm (100% Efficiency)!'
                : `You reached the treasure, but Dijkstra found a shorter route that saves ${
                    playerCost - (dijkstraResult?.totalDistance || 0)
                  } cost units!`}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="p-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 font-mono text-xs text-left space-y-1.5">
            <div className="flex justify-between border-b border-zinc-800 pb-1 text-zinc-400 text-[10px]">
              <span>Metric</span>
              <span>Your Route</span>
              <span>Dijkstra AI</span>
            </div>
            <div className="flex justify-between text-zinc-200">
              <span className="text-zinc-400">Total Cost:</span>
              <span className="font-bold">{playerCost}</span>
              <span className="font-bold text-emerald-400">{dijkstraResult?.totalDistance}</span>
            </div>
            <div className="flex justify-between text-zinc-200">
              <span className="text-zinc-400">Final Score:</span>
              <span className="font-bold text-amber-400">{playerScore} pts</span>
              <span className="font-bold text-emerald-400">{dijkstraOptimalScore} pts</span>
            </div>
            <div className="flex justify-between text-zinc-200">
              <span className="text-zinc-400">Path Match:</span>
              <span
                className={`font-bold ${
                  isOptimalMatch ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isOptimalMatch ? '100% Match ✅' : 'Sub-optimal ⚠️'}
              </span>
              <span className="text-emerald-400">Optimal (100%)</span>
            </div>
          </div>

          {/* Overlay Dijkstra on Canvas Toggle */}
          <button
            onClick={onToggleDijkstraOverlay}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border ${
              showDijkstraOverlay
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200'
            }`}
          >
            {showDijkstraOverlay ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>
              {showDijkstraOverlay
                ? 'Hide Dijkstra Path Overlay'
                : 'Show Dijkstra Optimal Route on Canvas'}
            </span>
          </button>
        </div>
      )}

      {/* 4. AVAILABLE CORRIDORS (When playing) */}
      {playerStatus === 'playing' && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-zinc-200 flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-emerald-400" />
              <span>Choose Your Next Corridor:</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {validMoves.length} option{validMoves.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-1.5">
            {validMoves.map(({ edge, targetNode }) => {
              const hazard = edge.hazard;
              const hazardLabel =
                hazard === 'monster' || edge.weight === 6
                  ? '👹 Monster Fight (Cost 6, -40 pts)'
                  : hazard === 'fire' || edge.weight === 8
                  ? '🔥 Fire Trap (Cost 8, -200 pts)'
                  : hazard === 'ice' || edge.weight === 3
                  ? '🧊 Ice Corridor (Cost 3, -75 pts)'
                  : hazard === 'coin' || edge.weight === 1
                  ? '🪙 Coin Stash (Cost 1, +60 pts bonus!)'
                  : `🚪 Safe Door (Cost 2, -50 pts)`;

              return (
                <button
                  key={edge.id}
                  onClick={() => onPlayerMove(targetNode!.id)}
                  className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-amber-500/80 hover:bg-amber-950/20 text-left flex items-center justify-between text-xs font-mono transition-all group cursor-pointer"
                >
                  <span className="text-zinc-100 font-bold group-hover:text-amber-300">
                    ➡️ {targetNode!.label}
                  </span>
                  <span className="text-amber-400 text-[11px] font-medium">
                    {hazardLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. JOURNEY LOG */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-medium block">
          Dungeon Traversal Log
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
  );
};
