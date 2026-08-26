import {
  KnowledgeMapGraph,
  KnowledgeMapNode,
  KnowledgeMapEdge,
  GraphLayoutResult,
} from '../../types/knowledgeMap';
import { getNodeDimensions } from './graphConstants';

interface LayoutOptions {
  viewportWidth?: number;
  viewportHeight?: number;
  collapsedNodeIds?: Set<string>;
}

/**
 * Organic, flexible mobile-first layout engine for Knowledge Maps.
 * Positions Root at top-center and branches sections with natural flow,
 * giving organic spacing while allowing 100% free interactive node dragging.
 */
export function layoutTopicGraph(
  graph: KnowledgeMapGraph,
  options: LayoutOptions = {}
): GraphLayoutResult {
  const {
    viewportWidth = 390,
    viewportHeight = 700,
    collapsedNodeIds = new Set<string>(),
  } = options;

  const positions = new Map<string, { x: number; y: number; width: number; height: number }>();

  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    return {
      positions,
      bounds: {
        minX: 0,
        maxX: viewportWidth,
        minY: 0,
        maxY: viewportHeight,
        width: viewportWidth,
        height: viewportHeight,
        centerX: viewportWidth / 2,
        centerY: viewportHeight / 2,
      },
      visibleNodes: [],
      visibleEdges: [],
    };
  }

  // 1. Build adjacency / parent-child maps
  const nodeMap = new Map<string, KnowledgeMapNode>();
  graph.nodes.forEach((n) => nodeMap.set(n.id, { ...n }));

  const childrenMap = new Map<string, string[]>();
  graph.nodes.forEach((n) => childrenMap.set(n.id, []));

  // Determine parentage based on edges or parentId
  graph.edges.forEach((edge) => {
    if (edge.source && edge.target && edge.source !== edge.target) {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      if (sourceNode && targetNode) {
        if (targetNode.depth > sourceNode.depth) {
          const list = childrenMap.get(edge.source) || [];
          if (!list.includes(edge.target)) {
            list.push(edge.target);
            childrenMap.set(edge.source, list);
          }
        }
      }
    }
  });

  // Also check parentId field for fallback
  graph.nodes.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      const list = childrenMap.get(node.parentId) || [];
      if (!list.includes(node.id)) {
        list.push(node.id);
        childrenMap.set(node.parentId, list);
      }
    }
  });

  // 2. Identify visible nodes & count hidden children for collapsed nodes
  const hiddenNodeIds = new Set<string>();

  function collectHiddenDescendants(parentId: string) {
    const directChildren = childrenMap.get(parentId) || [];
    for (const childId of directChildren) {
      hiddenNodeIds.add(childId);
      collectHiddenDescendants(childId);
    }
  }

  for (const collapsedId of collapsedNodeIds) {
    collectHiddenDescendants(collapsedId);
  }

  const visibleNodes: KnowledgeMapNode[] = [];
  graph.nodes.forEach((node) => {
    if (!hiddenNodeIds.has(node.id)) {
      const copy = { ...node };
      if (collapsedNodeIds.has(node.id)) {
        const directChildren = childrenMap.get(node.id) || [];
        copy.hiddenChildCount = directChildren.length;
      } else {
        copy.hiddenChildCount = 0;
      }
      visibleNodes.push(copy);
    }
  });

  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges: KnowledgeMapEdge[] = graph.edges.filter(
    (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
  );

  // 3. Dynamic Organic Tree Positioning
  const rootNode =
    visibleNodes.find((n) => n.id === graph.rootNodeId) ||
    visibleNodes.find((n) => n.type === 'root') ||
    visibleNodes[0];

  const centerX = Math.max(viewportWidth / 2, 230);
  let currentY = 55;

  if (rootNode) {
    const dims = getNodeDimensions(rootNode.type);
    positions.set(rootNode.id, {
      x: centerX,
      y: currentY,
      width: dims.width,
      height: dims.height,
    });
    currentY += dims.height + 48;
  }

  // Find Section nodes (direct children of Root)
  const sectionNodes = visibleNodes.filter(
    (n) => n.type === 'section' || (n.depth === 1 && n.id !== rootNode?.id)
  );

  sectionNodes.forEach((secNode, sIdx) => {
    const secDims = getNodeDimensions(secNode.type);
    // Subtle organic alternating stagger for natural mind-map aesthetics
    const staggerX = (sIdx % 2 === 0 ? -12 : 12);
    const secX = centerX + staggerX;

    positions.set(secNode.id, {
      x: secX,
      y: currentY,
      width: secDims.width,
      height: secDims.height,
    });

    const isCollapsed = collapsedNodeIds.has(secNode.id);
    const childIds = (childrenMap.get(secNode.id) || []).filter((id) =>
      visibleNodeIds.has(id)
    );

    currentY += secDims.height + 36;

    if (!isCollapsed && childIds.length > 0) {
      const colOffset = 90; // Balanced horizontal offset for child pairs

      for (let i = 0; i < childIds.length; i += 2) {
        const leftChildId = childIds[i];
        const rightChildId = childIds[i + 1];

        const leftNode = nodeMap.get(leftChildId);
        const leftDims = leftNode ? getNodeDimensions(leftNode.type) : getNodeDimensions('concept');

        if (rightChildId) {
          const rightNode = nodeMap.get(rightChildId);
          const rightDims = rightNode ? getNodeDimensions(rightNode.type) : getNodeDimensions('concept');

          positions.set(leftChildId, {
            x: secX - colOffset,
            y: currentY,
            width: leftDims.width,
            height: leftDims.height,
          });

          positions.set(rightChildId, {
            x: secX + colOffset,
            y: currentY,
            width: rightDims.width,
            height: rightDims.height,
          });
        } else {
          // Single child in row -> centered under section
          positions.set(leftChildId, {
            x: secX,
            y: currentY,
            width: leftDims.width,
            height: leftDims.height,
          });
        }

        currentY += 56;
      }

      currentY += 22;
    } else {
      currentY += 16;
    }
  });

  // Handle any remaining visible nodes
  const remainingNodes = visibleNodes.filter((n) => !positions.has(n.id));
  if (remainingNodes.length > 0) {
    for (const remNode of remainingNodes) {
      const remDims = getNodeDimensions(remNode.type);
      positions.set(remNode.id, {
        x: centerX,
        y: currentY,
        width: remDims.width,
        height: remDims.height,
      });
      currentY += remDims.height + 32;
    }
  }

  // 4. Compute bounding box
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  positions.forEach((pos) => {
    minX = Math.min(minX, pos.x - pos.width / 2);
    maxX = Math.max(maxX, pos.x + pos.width / 2);
    minY = Math.min(minY, pos.y - pos.height / 2);
    maxY = Math.max(maxY, pos.y + pos.height / 2);
  });

  if (minX === Infinity) {
    minX = 0;
    maxX = viewportWidth;
    minY = 0;
    maxY = viewportHeight;
  }

  const pad = 48;
  const boundMinX = Math.min(0, minX - pad);
  const boundMaxX = Math.max(viewportWidth, maxX + pad);
  const boundMinY = Math.max(0, minY - pad);
  const boundMaxY = Math.max(viewportHeight, maxY + pad);

  return {
    positions,
    bounds: {
      minX: boundMinX,
      maxX: boundMaxX,
      minY: boundMinY,
      maxY: boundMaxY,
      width: boundMaxX - boundMinX,
      height: boundMaxY - boundMinY,
      centerX: (boundMinX + boundMaxX) / 2,
      centerY: (boundMinY + boundMaxY) / 2,
    },
    visibleNodes,
    visibleEdges,
  };
}
