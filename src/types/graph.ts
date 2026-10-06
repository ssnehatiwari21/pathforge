export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  icon?: string; // Dungeon icon e.g. 🧙, 🏰, 💎, 👹, 🚪
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  hazard?: 'fire' | 'ice' | 'monster' | 'door' | 'coin' | 'normal';
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  isDirected: boolean;
}

export interface DijkstraStep {
  stepIndex: number;
  type: 'init' | 'select_min' | 'examine_neighbor' | 'relax_edge' | 'skip_edge' | 'finish' | 'unreachable';
  description: string;
  currentNodeId: string | null;
  activeNeighborId: string | null;
  currentEdgeId: string | null;
  visitedNodeIds: string[];
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  priorityQueue: { nodeId: string; distance: number }[];
  relaxedEdges: string[];
}

export interface DijkstraResult {
  steps: DijkstraStep[];
  pathNodeIds: string[];
  pathEdgeIds: string[];
  totalDistance: number;
  isReachable: boolean;
  sourceNodeId: string;
  targetNodeId: string;
}

export interface DynamicSubgraphHop {
  fromNode: GraphNode;
  toNode: GraphNode;
  edge: GraphEdge;
  edgeWeight: number;
  cumulativeDistance: number;
}

export interface DynamicPathSubgraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  hops: DynamicSubgraphHop[];
  totalDistance: number;
  hopCount: number;
  isReachable: boolean;
}
