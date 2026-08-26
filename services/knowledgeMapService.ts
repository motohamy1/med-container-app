import { KnowledgeMapGraph } from '../types/knowledgeMap';
import { SpecialtyData, TopicItem } from '../constants/SpecialtyData';
import { buildTopicGraph } from '../utils/knowledgeMap/buildTopicGraph';
import { normalizeKnowledgeGraph } from '../utils/knowledgeMap/normalizeKnowledgeGraph';
import { mergeKnowledgeGraphs } from '../utils/knowledgeMap/mergeKnowledgeGraphs';

export interface BuildKnowledgeMapParams {
  specialty?: SpecialtyData | { id: string; name?: string; scientificName?: string };
  topic: TopicItem;
}

export const knowledgeMapService = {
  /**
   * Builds a deterministic local knowledge graph from topic clinical guide data synchronously.
   */
  buildKnowledgeMap(params: BuildKnowledgeMapParams): KnowledgeMapGraph {
    const rawGraph = buildTopicGraph(params);
    return normalizeKnowledgeGraph(rawGraph);
  },

  /**
   * Builds a deterministic local knowledge graph asynchronously (compat).
   */
  async buildKnowledgeMapAsync(params: BuildKnowledgeMapParams): Promise<KnowledgeMapGraph> {
    return this.buildKnowledgeMap(params);
  },

  /**
   * Merges an existing base graph with an enrichment graph.
   */
  mergeGraphs(
    baseGraph: KnowledgeMapGraph,
    enrichmentGraph?: Partial<KnowledgeMapGraph> | null
  ): KnowledgeMapGraph {
    return mergeKnowledgeGraphs(baseGraph, enrichmentGraph);
  },

  /**
   * Optional AI graph enrichment endpoint with graceful fallback.
   */
  async requestAIGraphEnrichment(params: {
    specialtyId: string;
    topicId: string;
    topicName: string;
    conversation?: Array<{ text: string; isUser: boolean }>;
  }): Promise<KnowledgeMapGraph | null> {
    try {
      // Future backend endpoint: POST /api/knowledge-map
      // For V1, we cleanly fallback without throwing or interrupting the UI
      return null;
    } catch (error) {
      console.warn('AI graph enrichment unavailable, using local graph:', error);
      return null;
    }
  },
};
