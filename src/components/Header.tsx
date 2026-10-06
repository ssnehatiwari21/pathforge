import React, { useState } from 'react';
import { GitMerge, HelpCircle, X } from 'lucide-react';

interface HeaderProps {
  isDungeonMode: boolean;
  onToggleDungeonMode: (isDungeon: boolean) => void;
  isDirected: boolean;
  onToggleDirected: () => void;
  nodeCount: number;
  edgeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isDungeonMode,
  onToggleDungeonMode,
  isDirected,
  onToggleDirected,
  nodeCount,
  edgeCount,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <header className="h-13 py-2.5 px-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0 select-none z-20">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-lg border text-sm transition-colors ${
            isDungeonMode
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
          }`}
        >
          {isDungeonMode ? '🏰' : <GitMerge className="w-4 h-4" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-zinc-100">
            {isDungeonMode ? 'Dungeon Escape' : 'PathForge'}
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-xs text-zinc-400 font-mono">
            {isDungeonMode ? 'Rooms' : '|V|'} = <strong className="text-zinc-200">{nodeCount}</strong>,{' '}
            {isDungeonMode ? 'Corridors' : '|E|'} = <strong className="text-zinc-200">{edgeCount}</strong>
          </span>
        </div>
      </div>

      {/* Right Controls: [Rules] + [Lab | Dungeon] + [Directed | Undirected] */}
      <div className="flex items-center gap-2.5">
        {/* How to Play button */}
        {isDungeonMode && (
          <button
            onClick={() => setShowModal(true)}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>How to Play</span>
          </button>
        )}

        {/* 1. Mode switch: Lab | Dungeon */}
        <div className="flex p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium">
          <button
            onClick={() => isDungeonMode && onToggleDungeonMode(false)}
            className={`px-3 py-1 rounded-md transition-colors ${
              !isDungeonMode
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Lab
          </button>
          <button
            onClick={() => !isDungeonMode && onToggleDungeonMode(true)}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
              isDungeonMode
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Dungeon</span>
            <span>🏰</span>
          </button>
        </div>

        {/* 2. Directed / Undirected */}
        <div className="flex p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium">
          <button
            onClick={() => !isDirected && onToggleDirected()}
            className={`px-3 py-1 rounded-md transition-colors ${
              isDirected
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Directed corridors (one-way paths)"
          >
            Directed
          </button>
          <button
            onClick={() => {
              if (isDungeonMode) return;
              if (isDirected) onToggleDirected();
            }}
            disabled={isDungeonMode}
            className={`px-3 py-1 rounded-md transition-colors ${
              !isDirected
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDungeonMode
                ? 'text-zinc-600 cursor-not-allowed'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title={isDungeonMode ? 'Locked to Directed in Dungeon mode' : 'Undirected corridors'}
          >
            Undirected
          </button>
        </div>
      </div>

      {/* HOW TO PLAY MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏰</span>
                <h3 className="text-sm font-bold text-zinc-100">Dungeon Escape — Rules & How to Play</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
              <div>
                <strong className="text-emerald-400 block mb-0.5">🎯 Mission Objective:</strong>
                Guide your <strong>🧙 Hero</strong> from the starting entrance chamber to the <strong>💎 Treasure Vault</strong> while surviving deadly hazards and minimizing travel time!
              </div>

              <div>
                <strong className="text-sky-400 block mb-0.5">🕹️ Controls & Navigation:</strong>
                Click on any flashing green room with the <strong>MOVE ➡️</strong> badge directly on the canvas, or click corridor buttons in the right sidebar. You can also <strong>Undo</strong> or <strong>Restart</strong> anytime.
              </div>

              <div>
                <strong className="text-amber-400 block mb-1">⚠️ Corridor Hazards & Tile Costs:</strong>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                    <span className="font-bold">🚪 Door:</span> 2s time · 0 damage
                  </div>
                  <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                    <span className="font-bold">🧊 Ice:</span> 3s time · -4 HP slip
                  </div>
                  <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                    <span className="font-bold">👹 Monster:</span> 6s time · -15 HP beast fight
                  </div>
                  <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                    <span className="font-bold">🔥 Fire:</span> 8s time · -12 HP inferno
                  </div>
                  <div className="col-span-2 p-2 rounded bg-zinc-950 border border-zinc-800 text-yellow-300">
                    <span className="font-bold">🪙 Coin Vault:</span> 1s time · +10 🪙 Treasure Reward!
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200">
                🤖 <strong>AI Challenge:</strong> After you reach the treasure, compare your route with Dijkstra’s algorithm to see if you discovered the mathematically optimal path!
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs"
              >
                Got It, Let's Play!
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
