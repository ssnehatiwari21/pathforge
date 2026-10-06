import React, { useState, useEffect } from 'react';
import { GraphNode, GraphEdge, DijkstraResult, DijkstraStep } from './types/graph';
import { PRESETS } from './algorithms/presets';
import { runDijkstra } from './algorithms/dijkstra';
import { generateRandomDungeon } from './algorithms/dungeonGenerator';
import { Header } from './components/Header';
import { GraphCanvas } from './components/GraphCanvas';
import { RightPanel } from './components/RightPanel';
import { DungeonGamePanel } from './components/DungeonGamePanel';

export function App() {
  const [isDungeonMode, setIsDungeonMode] = useState<boolean>(false);

  // Lab Mode Graph State
  const initialLabPreset = PRESETS.routingNetwork;
  const [labNodes, setLabNodes] = useState<GraphNode[]>(initialLabPreset.nodes);
  const [labEdges, setLabEdges] = useState<GraphEdge[]>(initialLabPreset.edges);
  const [isDirected, setIsDirected] = useState<boolean>(true);

  // Lab Dijkstra State
  const [labDijkstraResult, setLabDijkstraResult] = useState<DijkstraResult | null>(null);
  const [labActiveDijkstraStep, setLabActiveDijkstraStep] = useState<DijkstraStep | null>(null);
  const [labShowOnlyPathOnCanvas, setLabShowOnlyPathOnCanvas] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // --- DUNGEON MODE PROCEDURAL GAME STATE ---
  const [dungeonNodes, setDungeonNodes] = useState<GraphNode[]>([]);
  const [dungeonEdges, setDungeonEdges] = useState<GraphEdge[]>([]);
  const [dungeonDijkstraResult, setDungeonDijkstraResult] = useState<DijkstraResult | null>(null);

  const [playerCurrentNodeId, setPlayerCurrentNodeId] = useState<string>('hero');
  const [playerPathNodeIds, setPlayerPathNodeIds] = useState<string[]>(['hero']);
  const [playerPathEdgeIds, setPlayerPathEdgeIds] = useState<string[]>([]);
  const [playerCost, setPlayerCost] = useState<number>(0);
  const [playerMonsters, setPlayerMonsters] = useState<number>(0);
  const [playerCoins, setPlayerCoins] = useState<number>(0);
  const [playerScore, setPlayerScore] = useState<number>(1000);
  const [playerStatus, setPlayerStatus] = useState<'playing' | 'won'>('playing');
  const [playerLogs, setPlayerLogs] = useState<string[]>([]);
  const [showDijkstraOverlay, setShowDijkstraOverlay] = useState<boolean>(false);

  // Generate a fresh random dungeon
  const handleGenerateNewDungeon = () => {
    const d = generateRandomDungeon();
    setDungeonNodes(d.nodes);
    setDungeonEdges(d.edges);

    // Compute optimal Dijkstra route immediately in the background
    const dijkstraRes = runDijkstra(d.nodes, d.edges, d.startNodeId, d.goalNodeId, true);
    setDungeonDijkstraResult(dijkstraRes);

    // Reset player
    setPlayerCurrentNodeId(d.startNodeId);
    setPlayerPathNodeIds([d.startNodeId]);
    setPlayerPathEdgeIds([]);
    setPlayerCost(0);
    setPlayerMonsters(0);
    setPlayerCoins(0);
    setPlayerScore(1000);
    setPlayerStatus('playing');
    setShowDijkstraOverlay(false);
    setPlayerLogs([
      `🎲 New dungeon generated with ${d.nodes.length} chambers and ${d.edges.length} corridors! Find the optimal path to 💎 Vault.`,
    ]);
  };

  // Switch between Lab Mode and Dungeon Mode
  const handleToggleDungeonMode = (dungeon: boolean) => {
    setIsDungeonMode(dungeon);
    setSelectedNodeId(null);

    if (dungeon) {
      setIsDirected(true);
      handleGenerateNewDungeon();
    } else {
      setIsDirected(true);
    }
  };

  // Player Move Action in Dungeon
  const handlePlayerMove = (targetNodeId: string) => {
    if (playerStatus !== 'playing') return;

    // Find connecting edge from current to target
    const edge = dungeonEdges.find(
      (e) => e.source === playerCurrentNodeId && e.target === targetNodeId
    );
    if (!edge) return;

    const targetNode = dungeonNodes.find((n) => n.id === targetNodeId);
    if (!targetNode) return;

    const nextCost = playerCost + edge.weight;
    let nextMonsters = playerMonsters;
    let nextCoins = playerCoins;
    let logMsg = '';

    if (edge.hazard === 'monster' || edge.weight === 6) {
      nextMonsters += 1;
      logMsg = `⚔️ Fought beast in ${targetNode.label}! (Cost +${edge.weight}, -40 pts penalty)`;
    } else if (edge.hazard === 'fire' || edge.weight === 8) {
      logMsg = `🔥 Crossed fire trap into ${targetNode.label}! (Cost +${edge.weight}, heavy penalty)`;
    } else if (edge.hazard === 'ice' || edge.weight === 3) {
      logMsg = `🧊 Traversed slippery ice to ${targetNode.label}! (Cost +${edge.weight})`;
    } else if (edge.hazard === 'coin' || edge.weight === 1) {
      nextCoins += 1;
      logMsg = `🪙 Found secret gold stash in ${targetNode.label}! (Cost +${edge.weight}, +60 pts bonus!)`;
    } else {
      logMsg = `🚪 Unlocked door into ${targetNode.label}! (Cost +${edge.weight})`;
    }

    // Calculate score
    const baseScore = 1000;
    const costPenalty = nextCost * 25;
    const monsterPenalty = nextMonsters * 40;
    const coinBonus = nextCoins * 60;
    let calcScore = Math.max(0, baseScore - costPenalty - monsterPenalty + coinBonus);

    // Check Victory
    const isGoal = targetNode.id === 'treasure' || targetNode.icon === '💎';
    if (isGoal) {
      const isMatched = dungeonDijkstraResult && nextCost === dungeonDijkstraResult.totalDistance;
      if (isMatched) {
        calcScore += 150; // Perfect match bonus!
        logMsg = `🏆 VICTORY! You discovered the PERFECT OPTIMAL ROUTE (+150 Bonus Points)!`;
      } else {
        logMsg = `🏁 Reached the 💎 Vault! Run completed with cost ${nextCost}.`;
      }
      setPlayerStatus('won');
    }

    setPlayerCost(nextCost);
    setPlayerMonsters(nextMonsters);
    setPlayerCoins(nextCoins);
    setPlayerScore(calcScore);
    setPlayerCurrentNodeId(targetNodeId);
    setPlayerPathNodeIds((prev) => [...prev, targetNodeId]);
    setPlayerPathEdgeIds((prev) => [...prev, edge.id]);
    setPlayerLogs((prev) => [logMsg, ...prev]);
  };

  // Reset current run
  const handleResetRun = () => {
    setPlayerCurrentNodeId('hero');
    setPlayerPathNodeIds(['hero']);
    setPlayerPathEdgeIds([]);
    setPlayerCost(0);
    setPlayerMonsters(0);
    setPlayerCoins(0);
    setPlayerScore(1000);
    setPlayerStatus('playing');
    setShowDijkstraOverlay(false);
    setPlayerLogs(['🧙 Reset back to entrance chamber! Try another route.']);
  };

  // Undo move
  const handleUndoMove = () => {
    if (playerPathNodeIds.length <= 1) return;
    const newPathNodes = playerPathNodeIds.slice(0, -1);
    const newPathEdges = playerPathEdgeIds.slice(0, -1);
    const prevNodeId = newPathNodes[newPathNodes.length - 1];

    let cost = 0;
    let monsters = 0;
    let coins = 0;

    newPathEdges.forEach((eId) => {
      const e = dungeonEdges.find((x) => x.id === eId);
      if (!e) return;
      cost += e.weight;
      if (e.hazard === 'monster' || e.weight === 6) monsters++;
      if (e.hazard === 'coin' || e.weight === 1) coins++;
    });

    const calcScore = Math.max(0, 1000 - cost * 25 - monsters * 40 + coins * 60);

    setPlayerCurrentNodeId(prevNodeId);
    setPlayerPathNodeIds(newPathNodes);
    setPlayerPathEdgeIds(newPathEdges);
    setPlayerCost(cost);
    setPlayerMonsters(monsters);
    setPlayerCoins(coins);
    setPlayerScore(calcScore);
    setPlayerStatus('playing');
    setShowDijkstraOverlay(false);
    setPlayerLogs((prev) => ['↩️ Undid last corridor move.', ...prev]);
  };

  // --- LAB MODE HANDLERS ---
  const handleLabAddNode = (x: number, y: number) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const existingLabels = new Set(labNodes.map((n) => n.label));
    let label = '';
    for (let i = 0; i < 200; i++) {
      const candidate =
        i < 26 ? alphabet[i] : `${alphabet[i % 26]}${Math.floor(i / 26)}`;
      if (!existingLabels.has(candidate)) {
        label = candidate;
        break;
      }
    }
    const newNode: GraphNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      label,
      x,
      y,
    };
    setLabNodes((prev) => [...prev, newNode]);
  };

  const handleLabAddEdge = (source: string, target: string, weight: number) => {
    let srcNode = labNodes.find((n) => n.id === source || n.label === source);
    let tgtNode = labNodes.find((n) => n.id === target || n.label === target);

    let updatedNodes = [...labNodes];
    if (!srcNode) {
      srcNode = { id: source, label: source, x: 200, y: 300 };
      updatedNodes.push(srcNode);
    }
    if (!tgtNode) {
      tgtNode = { id: target, label: target, x: 400, y: 300 };
      updatedNodes.push(tgtNode);
    }

    const exists = labEdges.some(
      (e) =>
        (e.source === srcNode.id && e.target === tgtNode.id) ||
        (!isDirected && e.source === tgtNode.id && e.target === srcNode.id)
    );

    if (exists) {
      setLabEdges((prev) =>
        prev.map((e) =>
          (e.source === srcNode.id && e.target === tgtNode.id) ||
          (!isDirected && e.source === tgtNode.id && e.target === srcNode.id)
            ? { ...e, weight }
            : e
        )
      );
    } else {
      const newEdge: GraphEdge = {
        id: `e_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        source: srcNode.id,
        target: tgtNode.id,
        weight,
      };
      setLabNodes(updatedNodes);
      setLabEdges((prev) => [...prev, newEdge]);
    }
  };

  const handleLabDeleteNode = (nodeId: string) => {
    setLabNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setLabEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleLabDeleteEdge = (edgeId: string) => {
    setLabEdges((prev) => prev.filter((e) => e.id !== edgeId));
  };

  const handleLabUpdateEdgeWeight = (edgeId: string, weight: number) => {
    setLabEdges((prev) =>
      prev.map((e) => (e.id === edgeId ? { ...e, weight: Math.max(0, weight) } : e))
    );
  };

  const handleLabApplyGraph = (newNodes: GraphNode[], newEdges: GraphEdge[]) => {
    setLabNodes(newNodes);
    setLabEdges(newEdges);
  };

  // Determine active nodes & edges based on mode
  const currentNodes = isDungeonMode ? dungeonNodes : labNodes;
  const currentEdges = isDungeonMode ? dungeonEdges : labEdges;

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Top Header with [Lab | Dungeon] Mode Switch */}
      <Header
        isDungeonMode={isDungeonMode}
        onToggleDungeonMode={handleToggleDungeonMode}
        isDirected={isDirected}
        onToggleDirected={() => !isDungeonMode && setIsDirected((d) => !d)}
        nodeCount={currentNodes.length}
        edgeCount={currentEdges.length}
      />

      {/* Main Workspace (Canvas on Left, Game / Lab on Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: GRAPH CANVAS */}
        <div className="flex-1 relative flex flex-col h-full overflow-hidden">
          <GraphCanvas
            nodes={currentNodes}
            edges={currentEdges}
            isDirected={isDirected}
            onUpdateNodes={isDungeonMode ? setDungeonNodes : setLabNodes}
            onAddNode={isDungeonMode ? () => {} : handleLabAddNode}
            onAddEdge={isDungeonMode ? () => {} : handleLabAddEdge}
            onDeleteNode={isDungeonMode ? () => {} : handleLabDeleteNode}
            onDeleteEdge={isDungeonMode ? () => {} : handleLabDeleteEdge}
            onUpdateEdgeWeight={isDungeonMode ? () => {} : handleLabUpdateEdgeWeight}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            activeDijkstraNodeId={
              isDungeonMode
                ? showDijkstraOverlay
                  ? dungeonDijkstraResult?.targetNodeId
                  : null
                : labActiveDijkstraStep?.currentNodeId
            }
            visitedNodeIds={
              isDungeonMode
                ? []
                : labActiveDijkstraStep?.visitedNodeIds
            }
            pathNodeIds={
              isDungeonMode
                ? showDijkstraOverlay
                  ? dungeonDijkstraResult?.pathNodeIds
                  : []
                : labActiveDijkstraStep?.type === 'finish' || labDijkstraResult?.isReachable
                ? labDijkstraResult?.pathNodeIds
                : []
            }
            pathEdgeIds={
              isDungeonMode
                ? showDijkstraOverlay
                  ? dungeonDijkstraResult?.pathEdgeIds
                  : []
                : labActiveDijkstraStep?.type === 'finish' || labDijkstraResult?.isReachable
                ? labDijkstraResult?.pathEdgeIds
                : []
            }
            activeDijkstraEdgeId={
              isDungeonMode ? null : labActiveDijkstraStep?.currentEdgeId
            }
            dijkstraDistances={
              isDungeonMode ? undefined : labActiveDijkstraStep?.distances
            }
            showPathOnly={isDungeonMode ? false : labShowOnlyPathOnCanvas}
            isDungeonMode={isDungeonMode}
            isPlayMode={isDungeonMode}
            playerCurrentNodeId={playerCurrentNodeId}
            onPlayerMove={handlePlayerMove}
            playerPathNodeIds={playerPathNodeIds}
            playerPathEdgeIds={playerPathEdgeIds}
          />
        </div>

        {/* RIGHT SIDE: DUNGEON GAME PANEL vs LAB PANEL */}
        <div className="w-[420px] xl:w-[460px] h-full border-l border-zinc-800 bg-zinc-950 flex flex-col shrink-0 select-none overflow-hidden">
          {isDungeonMode ? (
            /* Dedicated Dungeon Game Panel (No graph inputs, pure gameplay & score!) */
            <DungeonGamePanel
              nodes={dungeonNodes}
              edges={dungeonEdges}
              playerCurrentNodeId={playerCurrentNodeId}
              playerPathNodeIds={playerPathNodeIds}
              playerPathEdgeIds={playerPathEdgeIds}
              playerScore={playerScore}
              playerCost={playerCost}
              playerMonsters={playerMonsters}
              playerCoins={playerCoins}
              playerStatus={playerStatus}
              playerLogs={playerLogs}
              dijkstraResult={dungeonDijkstraResult}
              onPlayerMove={handlePlayerMove}
              onUndoMove={handleUndoMove}
              onResetRun={handleResetRun}
              onGenerateNewDungeon={handleGenerateNewDungeon}
              showDijkstraOverlay={showDijkstraOverlay}
              onToggleDijkstraOverlay={() => setShowDijkstraOverlay((prev) => !prev)}
            />
          ) : (
            /* Lab Mode Panel (Manual Edge List, Quick Add, Dijkstra calculation) */
            <RightPanel
              nodes={labNodes}
              edges={labEdges}
              isDirected={isDirected}
              selectedNodeId={selectedNodeId}
              onApplyGraph={handleLabApplyGraph}
              onAddEdge={handleLabAddEdge}
              dijkstraResult={labDijkstraResult}
              onDijkstraResultChange={setLabDijkstraResult}
              onStepChange={setLabActiveDijkstraStep}
              showOnlyPathOnCanvas={labShowOnlyPathOnCanvas}
              onToggleShowOnlyPath={() => setLabShowOnlyPathOnCanvas((prev) => !prev)}
              isDungeonMode={false}
              isPlayMode={false}
              onTogglePlayMode={() => {}}
              playerCurrentNodeId="hero"
              onPlayerMove={() => {}}
              onResetPlayer={() => {}}
              onUndoPlayerMove={() => {}}
              playerPathNodeIds={[]}
              playerPathEdgeIds={[]}
              playerHP={100}
              playerTime={0}
              playerCoins={0}
              playerMonsters={0}
              playerLogs={[]}
              playerStatus="playing"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
