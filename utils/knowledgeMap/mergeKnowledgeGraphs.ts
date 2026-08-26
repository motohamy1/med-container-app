import {
  KnowledgeMapGraph,
  KnowledgeMapNode,
  KnowledgeMapEdge,
} from '../../types/knowledgeMap';
import { normalizeKnowledgeGraph } from './normalizeKnowledgeGraph';
import { slugify } from './graphConstants';

export function mergeKnowledgeGraphs(
  baseGraph: KnowledgeMapGraph,
  enrichmentGraph?: Partial<KnowledgeMapGraph> | null
): KnowledgeMapGraph {
  if (!enrichmentGraph || !enrichmentGraph.nodes || enrichmentGraph.nodes.length === 0) {
    return normalizeKnowledgeGraph(baseGraph);
  }

  const mergedNodes: KnowledgeMapNode[] = [...baseGraph.nodes];
  const existingNodeIds = new Set(baseGraph.nodes.map((n) => n.id));
  const existingLabels = new Set(baseGraph.nodes.map((n) => slugify(n.label)));

  // Add non-duplicate nodes from enrichment
  for (const node of enrichmentGraph.nodes) {
    if (!node || !node.id) continue;
    const cleanId = slugify(node.id);
    const cleanLabel = slugify(node.label || node.id);

    if (!existingNodeIds.has(cleanId) && !existingLabels.has(cleanLabel)) {
      mergedNodes.push({
        ...node,
        id: cleanId,
        specialtyId: node.specialtyId || baseGraph.specialtyId,
        topicId: node.topicId || baseGraph.topicId,
      });
      existingNodeIds.add(cleanId);
      existingLabels.add(cleanLabel);
    }
  }

  // Add non-duplicate edges
  const mergedEdges: KnowledgeMapEdge[] = [...baseGraph.edges];
  const existingEdgeKeys = new Set(
    baseGraph.edges.map((e) => `${slugify(e.source)}->${slugify(e.target)}`)
  );

  if (enrichmentGraph.edges && Array.isArray(enrichmentGraph.edges)) {
    for (const edge of enrichmentGraph.edges) {
      if (!edge || !edge.source || !edge.target) continue;
      const cleanSource = slugify(edge.source);
      const cleanTarget = slugify(edge.target);
      const key = `${cleanSource}->${cleanTarget}`;

      if (!existingEdgeKeys.has(key) && existingNodeIds.has(cleanSource) && existingNodeIds.has(cleanTarget)) {
        mergedEdges.push({
          ...edge,
          id: edge.id || `e-${cleanSource}-${cleanTarget}`,
          source: cleanSource,
          target: cleanTarget,
        });
        existingEdgeKeys.add(key);
      }
    }
  }

  return normalizeKnowledgeGraph({
    ...baseGraph,
    nodes: mergedNodes,
    edges: mergedEdges,
    source: enrichmentGraph.source === 'ai-generated' ? 'hybrid' : baseGraph.source,
    generatedAt: new Date().toISOString(),
  });
}
