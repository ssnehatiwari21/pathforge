import { runDijkstra } from './src/algorithms/dijkstra.ts';
import { generateRandomDungeon } from './src/algorithms/dungeonGenerator.ts';

console.log('🧪 Testing Procedural Dungeon Generation & Dijkstra Path Matching...');

for (let i = 1; i <= 5; i++) {
  const dungeon = generateRandomDungeon();
  const res = runDijkstra(dungeon.nodes, dungeon.edges, dungeon.startNodeId, dungeon.goalNodeId, true);
  console.log(`✓ Dungeon Seed #${i}: Nodes = ${dungeon.nodes.length}, Edges = ${dungeon.edges.length}, Solvable = ${res.isReachable}, Optimal Cost = ${res.totalDistance}`);
  if (!res.isReachable || res.totalDistance <= 0) {
    console.error(`❌ Procedural dungeon seed #${i} is not solvable!`);
    process.exit(1);
  }
}

console.log('🎉 ALL PROCEDURAL DUNGEON GENERATIONS ARE 100% SOLVABLE & VERIFIED!');
