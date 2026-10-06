import { GraphNode, GraphEdge, DijkstraStep, DijkstraResult } from '../types/graph';

export function runDijkstra(
  nodes: GraphNode[],
  edges: GraphEdge[],
  sourceId: string,
  targetId: string,
  isDirected: boolean
): DijkstraResult {
  const steps: DijkstraStep[] = [];
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  const relaxedEdges: string[] = [];

  // Initialize
  nodes.forEach((node) => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  });
  distances[sourceId] = 0;

  // Build Adjacency List with edge references
  type AdjItem = { neighborId: string; weight: number; edgeId: string };
  const adj: Record<string, AdjItem[]> = {};
  nodes.forEach((n) => (adj[n.id] = []));

  edges.forEach((edge) => {
    adj[edge.source]?.push({
      neighborId: edge.target,
      weight: Math.max(0, edge.weight), // Dijkstra requires non-negative
      edgeId: edge.id,
    });
    if (!isDirected) {
      adj[edge.target]?.push({
        neighborId: edge.source,
        weight: Math.max(0, edge.weight),
        edgeId: edge.id,
      });
    }
  });

  const sourceNode = nodes.find((n) => n.id === sourceId);
  const targetNode = nodes.find((n) => n.id === targetId);

  // Step 0: Initialization
  steps.push({
    stepIndex: 0,
    type: 'init',
    description: `Initialized Dijkstra from source '${sourceNode?.label || sourceId}'. Set dist[${sourceNode?.label || sourceId}] = 0, all others = ∞.`,
    currentNodeId: null,
    activeNeighborId: null,
    currentEdgeId: null,
    visitedNodeIds: [],
    distances: { ...distances },
    previous: { ...previous },
    priorityQueue: [{ nodeId: sourceId, distance: 0 }],
    relaxedEdges: [],
  });

  const pq: { nodeId: string; distance: number }[] = [{ nodeId: sourceId, distance: 0 }];

  while (pq.length > 0) {
    // Sort to extract minimum
    pq.sort((a, b) => a.distance - b.distance);
    const { nodeId: u, distance: d } = pq.shift()!;

    if (visited.has(u)) continue;

    const uNode = nodes.find((n) => n.id === u);

    // If infinite, unreachable
    if (d === Infinity) break;

    visited.add(u);

    // Step: Select min
    steps.push({
      stepIndex: steps.length,
      type: 'select_min',
      description: `Extracted '${uNode?.label}' with current minimum distance ${d} from the priority queue. Marked as visited.`,
      currentNodeId: u,
      activeNeighborId: null,
      currentEdgeId: null,
      visitedNodeIds: Array.from(visited),
      distances: { ...distances },
      previous: { ...previous },
      priorityQueue: pq.map((item) => ({ ...item })),
      relaxedEdges: [...relaxedEdges],
    });

    // Check if reached target
    if (u === targetId) {
      break;
    }

    // Inspect neighbors
    for (const { neighborId: v, weight, edgeId } of adj[u] || []) {
      const vNode = nodes.find((n) => n.id === v);
      if (visited.has(v)) continue;

      const newDist = distances[u] + weight;
      const currentNeighborDist = distances[v];

      if (newDist < currentNeighborDist) {
        distances[v] = newDist;
        previous[v] = u;
        if (!relaxedEdges.includes(edgeId)) {
          relaxedEdges.push(edgeId);
        }

        pq.push({ nodeId: v, distance: newDist });

        steps.push({
          stepIndex: steps.length,
          type: 'relax_edge',
          description: `Relaxed edge (${uNode?.label} -> ${vNode?.label}, weight ${weight}): New distance = ${distances[u]} + ${weight} = ${newDist} < ${currentNeighborDist === Infinity ? '∞' : currentNeighborDist}.`,
          currentNodeId: u,
          activeNeighborId: v,
          currentEdgeId: edgeId,
          visitedNodeIds: Array.from(visited),
          distances: { ...distances },
          previous: { ...previous },
          priorityQueue: pq.map((item) => ({ ...item })).sort((a, b) => a.distance - b.distance),
          relaxedEdges: [...relaxedEdges],
        });
      } else {
        steps.push({
          stepIndex: steps.length,
          type: 'skip_edge',
          description: `Inspected edge (${uNode?.label} -> ${vNode?.label}, weight ${weight}): dist[${uNode?.label}] + ${weight} = ${newDist} >= current dist[${vNode?.label}] = ${currentNeighborDist}. No update needed.`,
          currentNodeId: u,
          activeNeighborId: v,
          currentEdgeId: edgeId,
          visitedNodeIds: Array.from(visited),
          distances: { ...distances },
          previous: { ...previous },
          priorityQueue: pq.map((item) => ({ ...item })).sort((a, b) => a.distance - b.distance),
          relaxedEdges: [...relaxedEdges],
        });
      }
    }
  }

  // Reconstruct Shortest Path
  const isReachable = distances[targetId] !== Infinity;
  const pathNodeIds: string[] = [];
  const pathEdgeIds: string[] = [];

  if (isReachable) {
    let curr: string | null = targetId;
    while (curr !== null) {
      pathNodeIds.unshift(curr);
      const prevNode: string | null = previous[curr];
      if (prevNode) {
        // Find connecting edge
        const matchedEdge = edges.find(
          (e) =>
            (e.source === prevNode && e.target === curr) ||
            (!isDirected && e.target === prevNode && e.source === curr)
        );
        if (matchedEdge) {
          pathEdgeIds.unshift(matchedEdge.id);
        }
      }
      curr = prevNode;
    }

    steps.push({
      stepIndex: steps.length,
      type: 'finish',
      description: `Shortest path to target '${targetNode?.label || targetId}' discovered! Total Cost = ${distances[targetId]}. Path: ${pathNodeIds.map((id) => nodes.find((n) => n.id === id)?.label).join(' → ')}.`,
      currentNodeId: targetId,
      activeNeighborId: null,
      currentEdgeId: null,
      visitedNodeIds: Array.from(visited),
      distances: { ...distances },
      previous: { ...previous },
      priorityQueue: [],
      relaxedEdges: [...relaxedEdges],
    });
  } else {
    steps.push({
      stepIndex: steps.length,
      type: 'unreachable',
      description: `Target '${targetNode?.label || targetId}' is unreachable from '${sourceNode?.label || sourceId}'.`,
      currentNodeId: null,
      activeNeighborId: null,
      currentEdgeId: null,
      visitedNodeIds: Array.from(visited),
      distances: { ...distances },
      previous: { ...previous },
      priorityQueue: [],
      relaxedEdges: [...relaxedEdges],
    });
  }

  return {
    steps,
    pathNodeIds,
    pathEdgeIds,
    totalDistance: isReachable ? distances[targetId] : Infinity,
    isReachable,
    sourceNodeId: sourceId,
    targetNodeId: targetId,
  };
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

export function extractPathSubgraph(
  allNodes: GraphNode[],
  allEdges: GraphEdge[],
  dijkstraResult: DijkstraResult
): DynamicPathSubgraph {
  const { pathNodeIds, pathEdgeIds, totalDistance, isReachable } = dijkstraResult;
  if (!isReachable || pathNodeIds.length === 0) {
    return {
      nodes: [],
      edges: [],
      hops: [],
      totalDistance: Infinity,
      hopCount: 0,
      isReachable: false,
    };
  }

  const subNodes = allNodes.filter((n) => pathNodeIds.includes(n.id));
  const subEdges = allEdges.filter((e) => pathEdgeIds.includes(e.id));

  const hops: DynamicSubgraphHop[] = [];
  let currentCumDist = 0;

  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const fromId = pathNodeIds[i];
    const toId = pathNodeIds[i + 1];
    const fromNode = allNodes.find((n) => n.id === fromId)!;
    const toNode = allNodes.find((n) => n.id === toId)!;
    const edge = allEdges.find((e) => pathEdgeIds[i] === e.id)!;
    const w = edge ? edge.weight : 0;
    currentCumDist += w;

    hops.push({
      fromNode,
      toNode,
      edge,
      edgeWeight: w,
      cumulativeDistance: currentCumDist,
    });
  }

  return {
    nodes: subNodes,
    edges: subEdges,
    hops,
    totalDistance,
    hopCount: hops.length,
    isReachable: true,
  };
}
