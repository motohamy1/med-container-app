export type KnowledgeNodeType =
  | "root"
  | "section"
  | "concept"
  | "finding"
  | "investigation"
  | "treatment"
  | "drug"
  | "complication"
  | "red-flag"
  | "citation"
  | "question";

export type KnowledgeEdgeType =
  | "contains"
  | "causes"
  | "associated-with"
  | "presents-with"
  | "diagnosed-by"
  | "treated-with"
  | "complicated-by"
  | "supports"
  | "related-to"
  | "derived-from"
  | "asks-about";

export interface KnowledgeMapNode {
  id: string;
  label: string;
  type: KnowledgeNodeType;

  /**
   * Optional short description.
   * Never put large medical answers inside the node itself.
   */
  summary?: string;

  /**
   * Original content reference.
   * Examples:
   * - guide section ID
   * - chat message ID
   * - backend source ID
   */
  sourceId?: string;

  /**
   * Route/context needed when opening the content.
   */
  specialtyId?: string;
  topicId?: string;

  /**
   * Used for graph layout.
   */
  depth: number;

  /**
   * Parent node ID in the hierarchical tree structure.
   */
  parentId?: string;

  /**
   * Optional fixed position if user moves the node.
   */
  position?: {
    x: number;
    y: number;
  };

  /**
   * Whether this node has hidden children.
   */
  expandable?: boolean;

  /**
   * Number of hidden children.
   */
  hiddenChildCount?: number;

  /**
   * Whether this node is currently selected/focused.
   */
  selectable?: boolean;

  /**
   * Used for UI semantics, not raw color.
   */
  priority?: "primary" | "secondary" | "tertiary";
}

export interface KnowledgeMapEdge {
  id: string;

  source: string;
  target: string;

  type: KnowledgeEdgeType;

  label?: string;

  /**
   * Optional confidence from server-generated graph data.
   * Range 0..1.
   */
  confidence?: number;

  /**
   * ID of source content if applicable.
   */
  sourceId?: string;
}

export interface KnowledgeMapGraph {
  id: string;

  rootNodeId: string;

  specialtyId?: string;
  specialtyName?: string;

  topicId?: string;
  topicName?: string;

  generatedAt: string;

  version: number;

  nodes: KnowledgeMapNode[];

  edges: KnowledgeMapEdge[];

  /**
   * Used to detect whether graph is local/deterministic or AI-generated.
   */
  source: "topic-guide" | "conversation" | "hybrid" | "ai-generated";

  /**
   * If true, graph can be enriched/updated without replacing the UI.
   */
  isExpandable?: boolean;
}

export interface GraphLayoutResult {
  positions: Map<string, { x: number; y: number; width: number; height: number }>;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  };
  visibleNodes: KnowledgeMapNode[];
  visibleEdges: KnowledgeMapEdge[];
}
