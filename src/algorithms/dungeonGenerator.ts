import { GraphNode, GraphEdge } from '../types/graph';

const ROOM_NAMES = [
  { name: 'Castle Keep', icon: '🏰' },
  { name: 'Iron Gates', icon: '🚪' },
  { name: 'Echoing Caves', icon: '🪨' },
  { name: 'Monster Lair', icon: '👹' },
  { name: 'Lava Forge', icon: '🌋' },
  { name: 'Ancient Crypt', icon: '🕸️' },
  { name: 'Alchemist Lab', icon: '⚗️' },
  { name: 'Sunken Temple', icon: '🏛️' },
  { name: 'Armory', icon: '⚔️' },
  { name: 'Whispering Den', icon: '🐺' },
];

export interface GeneratedDungeon {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startNodeId: string;
  goalNodeId: string;
}

export function generateRandomDungeon(): GeneratedDungeon {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  let edgeCounter = 1;

  // Layer 0: Entrance (Hero Start)
  const startNode: GraphNode = {
    id: 'hero',
    label: '🧙 Entrance',
    icon: '🧙',
    x: 100,
    y: 300,
  };
  nodes.push(startNode);

  // Shuffle room names
  const shuffledNames = [...ROOM_NAMES].sort(() => Math.random() - 0.5);
  let nameIdx = 0;

  // Layer 1: 2 rooms
  const layer1: GraphNode[] = [
    {
      id: `r_l1_1`,
      label: `${shuffledNames[nameIdx].icon} ${shuffledNames[nameIdx].name}`,
      icon: shuffledNames[nameIdx].icon,
      x: 270,
      y: 190,
    },
    {
      id: `r_l1_2`,
      label: `${shuffledNames[nameIdx + 1].icon} ${shuffledNames[nameIdx + 1].name}`,
      icon: shuffledNames[nameIdx + 1].icon,
      x: 270,
      y: 410,
    },
  ];
  nameIdx += 2;
  nodes.push(...layer1);

  // Layer 2: 2 or 3 rooms
  const layer2Count = Math.random() > 0.4 ? 3 : 2;
  const layer2: GraphNode[] = [];
  if (layer2Count === 3) {
    layer2.push(
      {
        id: `r_l2_1`,
        label: `${shuffledNames[nameIdx].icon} ${shuffledNames[nameIdx].name}`,
        icon: shuffledNames[nameIdx].icon,
        x: 450,
        y: 150,
      },
      {
        id: `r_l2_2`,
        label: `${shuffledNames[nameIdx + 1].icon} ${shuffledNames[nameIdx + 1].name}`,
        icon: shuffledNames[nameIdx + 1].icon,
        x: 450,
        y: 300,
      },
      {
        id: `r_l2_3`,
        label: `${shuffledNames[nameIdx + 2].icon} ${shuffledNames[nameIdx + 2].name}`,
        icon: shuffledNames[nameIdx + 2].icon,
        x: 450,
        y: 450,
      }
    );
    nameIdx += 3;
  } else {
    layer2.push(
      {
        id: `r_l2_1`,
        label: `${shuffledNames[nameIdx].icon} ${shuffledNames[nameIdx].name}`,
        icon: shuffledNames[nameIdx].icon,
        x: 450,
        y: 200,
      },
      {
        id: `r_l2_2`,
        label: `${shuffledNames[nameIdx + 1].icon} ${shuffledNames[nameIdx + 1].name}`,
        icon: shuffledNames[nameIdx + 1].icon,
        x: 450,
        y: 400,
      }
    );
    nameIdx += 2;
  }
  nodes.push(...layer2);

  // Layer 3: 2 rooms
  const layer3: GraphNode[] = [
    {
      id: `r_l3_1`,
      label: `${shuffledNames[nameIdx].icon} ${shuffledNames[nameIdx].name}`,
      icon: shuffledNames[nameIdx].icon,
      x: 620,
      y: 190,
    },
    {
      id: `r_l3_2`,
      label: `${shuffledNames[nameIdx + 1].icon} ${shuffledNames[nameIdx + 1].name}`,
      icon: shuffledNames[nameIdx + 1].icon,
      x: 620,
      y: 410,
    },
  ];
  nameIdx += 2;
  nodes.push(...layer3);

  // Layer 4: Treasure Vault (Goal)
  const goalNode: GraphNode = {
    id: 'treasure',
    label: '💎 Vault',
    icon: '💎',
    x: 770,
    y: 300,
  };
  nodes.push(goalNode);

  // HAZARDS POOL
  const HAZARDS: { hazard: 'door' | 'ice' | 'monster' | 'fire' | 'coin'; weight: number }[] = [
    { hazard: 'door', weight: 2 },
    { hazard: 'door', weight: 2 },
    { hazard: 'ice', weight: 3 },
    { hazard: 'ice', weight: 3 },
    { hazard: 'monster', weight: 6 },
    { hazard: 'monster', weight: 6 },
    { hazard: 'fire', weight: 8 },
    { hazard: 'coin', weight: 1 },
  ];

  const getRandomHazard = () => {
    return HAZARDS[Math.floor(Math.random() * HAZARDS.length)];
  };

  // Connect Start -> Layer 1
  layer1.forEach((n) => {
    const h = getRandomHazard();
    edges.push({
      id: `d_edge_${edgeCounter++}`,
      source: startNode.id,
      target: n.id,
      weight: h.weight,
      hazard: h.hazard,
    });
  });

  // Connect Layer 1 -> Layer 2 (Each L1 node connects to 1 or 2 L2 nodes)
  layer1.forEach((n1) => {
    layer2.forEach((n2) => {
      // 70% chance of edge to create diverse branching
      if (Math.random() > 0.3) {
        const h = getRandomHazard();
        edges.push({
          id: `d_edge_${edgeCounter++}`,
          source: n1.id,
          target: n2.id,
          weight: h.weight,
          hazard: h.hazard,
        });
      }
    });
  });

  // Ensure every Layer 2 node has at least one incoming edge
  layer2.forEach((n2) => {
    const hasIncoming = edges.some((e) => e.target === n2.id);
    if (!hasIncoming) {
      const randomL1 = layer1[Math.floor(Math.random() * layer1.length)];
      const h = getRandomHazard();
      edges.push({
        id: `d_edge_${edgeCounter++}`,
        source: randomL1.id,
        target: n2.id,
        weight: h.weight,
        hazard: h.hazard,
      });
    }
  });

  // Connect Layer 2 -> Layer 3
  layer2.forEach((n2) => {
    layer3.forEach((n3) => {
      if (Math.random() > 0.35) {
        const h = getRandomHazard();
        edges.push({
          id: `d_edge_${edgeCounter++}`,
          source: n2.id,
          target: n3.id,
          weight: h.weight,
          hazard: h.hazard,
        });
      }
    });
  });

  // Ensure every Layer 3 node has incoming
  layer3.forEach((n3) => {
    const hasIncoming = edges.some((e) => e.target === n3.id);
    if (!hasIncoming) {
      const randomL2 = layer2[Math.floor(Math.random() * layer2.length)];
      const h = getRandomHazard();
      edges.push({
        id: `d_edge_${edgeCounter++}`,
        source: randomL2.id,
        target: n3.id,
        weight: h.weight,
        hazard: h.hazard,
      });
    }
  });

  // Connect Layer 3 -> Goal
  layer3.forEach((n3) => {
    const h = getRandomHazard();
    edges.push({
      id: `d_edge_${edgeCounter++}`,
      source: n3.id,
      target: goalNode.id,
      weight: h.weight,
      hazard: h.hazard,
    });
  });

  // Occasional shortcut from Layer 2 directly to Goal
  if (Math.random() > 0.5) {
    const randomL2 = layer2[Math.floor(Math.random() * layer2.length)];
    // Make shortcut a high risk/high reward or monster corridor
    edges.push({
      id: `d_edge_${edgeCounter++}`,
      source: randomL2.id,
      target: goalNode.id,
      weight: 6,
      hazard: 'monster',
    });
  }

  return {
    nodes,
    edges,
    startNodeId: startNode.id,
    goalNodeId: goalNode.id,
  };
}
