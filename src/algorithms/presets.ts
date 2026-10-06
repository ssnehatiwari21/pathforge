import { GraphNode, GraphEdge } from '../types/graph';

export interface PresetGraph {
  name: string;
  description: string;
  isDirected: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const PRESETS: Record<string, PresetGraph> = {
  routingNetwork: {
    name: 'Lab Routing Network (6 Nodes)',
    description: 'Multiple competing routes with bottle-neck edges, ideal for observing Dijkstra relaxation.',
    isDirected: true,
    nodes: [
      { id: 'A', label: 'A', x: 140, y: 300 },
      { id: 'B', label: 'B', x: 300, y: 160 },
      { id: 'C', label: 'C', x: 300, y: 440 },
      { id: 'D', label: 'D', x: 500, y: 160 },
      { id: 'E', label: 'E', x: 500, y: 440 },
      { id: 'F', label: 'F', x: 660, y: 300 },
    ],
    edges: [
      { id: 'e1', source: 'A', target: 'B', weight: 4 },
      { id: 'e2', source: 'A', target: 'C', weight: 2 },
      { id: 'e3', source: 'B', target: 'C', weight: 1 },
      { id: 'e4', source: 'B', target: 'D', weight: 5 },
      { id: 'e5', source: 'C', target: 'D', weight: 8 },
      { id: 'e6', source: 'C', target: 'E', weight: 10 },
      { id: 'e7', source: 'D', target: 'E', weight: 2 },
      { id: 'e8', source: 'D', target: 'F', weight: 6 },
      { id: 'e9', source: 'E', target: 'F', weight: 3 },
    ],
  },
  dungeonEscape: {
    name: 'Dungeon Escape',
    description: 'Find the optimal path for the 🧙 Hero to reach the 💎 Treasure while surviving hazards.',
    isDirected: true,
    nodes: [
      { id: 'hero', label: '🧙 Hero', icon: '🧙', x: 140, y: 300 },
      { id: 'castle', label: '🏰 Keep', icon: '🏰', x: 320, y: 160 },
      { id: 'gate', label: '🚪 Gates', icon: '🚪', x: 320, y: 440 },
      { id: 'cave', label: '🪨 Caverns', icon: '🪨', x: 500, y: 160 },
      { id: 'lair', label: '👹 Lair', icon: '👹', x: 500, y: 440 },
      { id: 'treasure', label: '💎 Vault', icon: '💎', x: 680, y: 300 },
    ],
    edges: [
      { id: 'd1', source: 'hero', target: 'castle', weight: 8, hazard: 'fire' },
      { id: 'd2', source: 'hero', target: 'gate', weight: 2, hazard: 'door' },
      { id: 'd3', source: 'castle', target: 'cave', weight: 1, hazard: 'coin' },
      { id: 'd4', source: 'gate', target: 'lair', weight: 6, hazard: 'monster' },
      { id: 'd5', source: 'gate', target: 'cave', weight: 3, hazard: 'ice' },
      { id: 'd6', source: 'castle', target: 'lair', weight: 8, hazard: 'fire' },
      { id: 'd7', source: 'cave', target: 'treasure', weight: 3, hazard: 'ice' },
      { id: 'd8', source: 'lair', target: 'treasure', weight: 2, hazard: 'door' },
    ],
  },
};
