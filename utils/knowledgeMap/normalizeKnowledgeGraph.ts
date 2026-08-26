import {
  KnowledgeMapGraph,
  KnowledgeMapNode,
  KnowledgeMapEdge,
  KnowledgeNodeType,
  KnowledgeEdgeType,
} from '../../types/knowledgeMap';
import {
  GRAPH_CONFIG,
  VALID_NODE_TYPES,
  VALID_EDGE_TYPES,
  slugify,
} from './graphConstants';

export function normalizeKnowledgeGraph(
  rawGraph: Partial<KnowledgeMapGraph> | null | undefined
): KnowledgeMapGraph {
  if (!rawGraph) {
    const fallbackId = 'clinical-topic';
    return {
      id: fallbackId,
      rootNodeId: fallbackId,
      generatedAt: new Date().toISOString(),
      version: 1,
      source: 'topic-guide',
      nodes: [
        {
          id: fallbackId,
          label: 'Clinical Topic',
          type: 'root',
          depth: 0,
          selectable: true,
        },
      ],
      edges: [],
    };
  }

  const topicId = rawGraph.topicId || rawGraph.id || 'topic';
  const topicName = rawGraph.topicName || rawGraph.id || 'Clinical Topic';

  // 1. Process & deduplicate nodes
  const nodeMap = new Map<string, KnowledgeMapNode>();
  const rawNodes = Array.isArray(rawGraph.nodes) ? rawGraph.nodes : [];

  for (const rawNode of rawNodes) {
    if (!rawNode || typeof rawNode !== 'object') continue;

    const rawId = String(rawNode.id || '').trim();
    if (!rawId) continue;

    const id = slugify(rawId);
    if (nodeMap.has(id)) continue;

    const rawLabel = String(rawNode.label || id).trim();
    const label = rawLabel.slice(0, GRAPH_CONFIG.maxLabelLength) || id;

    const rawType = rawNode.type as KnowledgeNodeType;
    const type: KnowledgeNodeType = VALID_NODE_TYPES.has(rawType)
      ? rawType
      : 'concept';

    const summary = rawNode.summary
      ? String(rawNode.summary).trim().slice(0, GRAPH_CONFIG.maxSummaryLength)
      : undefined;

    const depth = typeof rawNode.depth === 'number' && rawNode.depth >= 0 ? rawNode.depth : 1;
    const parentId = rawNode.parentId ? slugify(String(rawNode.parentId)) : undefined;

    nodeMap.set(id, {
      id,
      label,
      type,
      summary,
      sourceId: rawNode.sourceId ? String(rawNode.sourceId) : undefined,
      specialtyId: rawNode.specialtyId || rawGraph.specialtyId,
      topicId: rawNode.topicId || rawGraph.topicId,
      depth,
      parentId,
      expandable: rawNode.expandable,
      hiddenChildCount: rawNode.hiddenChildCount,
      selectable: rawNode.selectable !== false,
      priority: rawNode.priority,
    });

    if (nodeMap.size >= GRAPH_CONFIG.maxNodes) break;
  }

  // 2. Guarantee root node
  let rootNodeId = rawGraph.rootNodeId ? slugify(String(rawGraph.rootNodeId)) : '';

  if (!rootNodeId || !nodeMap.has(rootNodeId)) {
    // Find node with depth 0 or type === 'root'
    let foundRootId = '';
    for (const [id, node] of nodeMap.entries()) {
      if (node.depth === 0 || node.type === 'root') {
        foundRootId = id;
        break;
      }
    }

    if (foundRootId) {
      rootNodeId = foundRootId;
      const rootNode = nodeMap.get(rootNodeId)!;
      rootNode.type = 'root';
      rootNode.depth = 0;
    } else {
      // Create root node
      rootNodeId = slugify(topicId);
      nodeMap.set(rootNodeId, {
        id: rootNodeId,
        label: topicName,
        type: 'root',
        depth: 0,
        specialtyId: rawGraph.specialtyId,
        topicId: rawGraph.topicId,
        selectable: true,
        priority: 'primary',
      });
    }
  } else {
    const rootNode = nodeMap.get(rootNodeId)!;
    rootNode.type = 'root';
    rootNode.depth = 0;
  }

  // 3. Process & deduplicate edges
  const edgeMap = new Map<string, KnowledgeMapEdge>();
  const rawEdges = Array.isArray(rawGraph.edges) ? rawGraph.edges : [];

  for (const rawEdge of rawEdges) {
    if (!rawEdge || typeof rawEdge !== 'object') continue;

    const source = slugify(String(rawEdge.source || '').trim());
    const target = slugify(String(rawEdge.target || '').trim());

    // Validation: source and target must exist and not be a self-loop
    if (!source || !target || source === target) continue;
    if (!nodeMap.has(source) || !nodeMap.has(target)) continue;

    const edgeKey = `${source}->${target}`;
    if (edgeMap.has(edgeKey)) continue;

    const rawEdgeType = rawEdge.type as KnowledgeEdgeType;
    const type: KnowledgeEdgeType = VALID_EDGE_TYPES.has(rawEdgeType)
      ? rawEdgeType
      : 'related-to';

    const edgeId = rawEdge.id ? String(rawEdge.id).trim() : `e-${source}-${target}`;

    let confidence: number | undefined = undefined;
    if (typeof rawEdge.confidence === 'number' && !isNaN(rawEdge.confidence)) {
      confidence = Math.max(0, Math.min(1, rawEdge.confidence));
    }

    const label = rawEdge.label
      ? String(rawEdge.label).trim().slice(0, 40)
      : undefined;

    edgeMap.set(edgeKey, {
      id: edgeId,
      source,
      target,
      type,
      label,
      confidence,
      sourceId: rawEdge.sourceId ? String(rawEdge.sourceId) : undefined,
    });

    if (edgeMap.size >= GRAPH_CONFIG.maxEdges) break;
  }

  return {
    id: rawGraph.id ? String(rawGraph.id) : `${rawGraph.specialtyId || 'spec'}-${slugify(topicId)}`,
    rootNodeId,
    specialtyId: rawGraph.specialtyId,
    specialtyName: rawGraph.specialtyName,
    topicId: rawGraph.topicId || topicId,
    topicName,
    generatedAt: rawGraph.generatedAt || new Date().toISOString(),
    version: 1,
    source: rawGraph.source || 'topic-guide',
    isExpandable: rawGraph.isExpandable !== false,
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()),
  };
}
