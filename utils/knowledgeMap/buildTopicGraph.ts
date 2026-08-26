import {
  KnowledgeMapGraph,
  KnowledgeMapNode,
  KnowledgeMapEdge,
  KnowledgeNodeType,
  KnowledgeEdgeType,
} from '../../types/knowledgeMap';
import { TopicItem, SpecialtyData } from '../../constants/SpecialtyData';
import { slugify } from './graphConstants';
import { normalizeKnowledgeGraph } from './normalizeKnowledgeGraph';

function inferSectionType(title: string): {
  nodeType: KnowledgeNodeType;
  edgeType: KnowledgeEdgeType;
} {
  const upper = title.toUpperCase();

  if (
    upper.includes('EMERGENCY') ||
    upper.includes('RED FLAG') ||
    upper.includes('COMPLICATION') ||
    upper.includes('CONTRAINDICATION') ||
    upper.includes('CRITICAL')
  ) {
    return { nodeType: 'red-flag', edgeType: 'complicated-by' };
  }

  if (
    upper.includes('MANAGEMENT') ||
    upper.includes('TREATMENT') ||
    upper.includes('THERAPY') ||
    upper.includes('PROTOCOL') ||
    upper.includes('DOSING') ||
    upper.includes('REGIMEN') ||
    upper.includes('SURGICAL')
  ) {
    return { nodeType: 'treatment', edgeType: 'treated-with' };
  }

  if (
    upper.includes('INVESTIGATION') ||
    upper.includes('WORKUP') ||
    upper.includes('DIAGNOS') ||
    upper.includes('CRITERIA') ||
    upper.includes('SCORING') ||
    upper.includes('ASSESSMENT')
  ) {
    return { nodeType: 'investigation', edgeType: 'diagnosed-by' };
  }

  if (
    upper.includes('PRESENTATION') ||
    upper.includes('SYMPTOM') ||
    upper.includes('CLINICAL PICTURE') ||
    upper.includes('SIGNS') ||
    upper.includes('EXAMINATION')
  ) {
    return { nodeType: 'finding', edgeType: 'presents-with' };
  }

  return { nodeType: 'section', edgeType: 'contains' };
}

function inferConceptType(
  label: string,
  parentSectionType: KnowledgeNodeType
): { nodeType: KnowledgeNodeType; edgeType: KnowledgeEdgeType } {
  const lower = label.toLowerCase();

  if (
    lower.includes('shock') ||
    lower.includes('failure') ||
    lower.includes('death') ||
    lower.includes('arrest') ||
    lower.includes('rupture') ||
    lower.includes('perforation') ||
    lower.includes('bleed') ||
    lower.includes('toxicity') ||
    lower.includes('contraindicated')
  ) {
    return { nodeType: 'red-flag', edgeType: 'complicated-by' };
  }

  if (
    lower.includes('mg') ||
    lower.includes('mcg') ||
    lower.includes('iv') ||
    lower.includes('infusion') ||
    lower.includes('inhibitor') ||
    lower.includes('blocker') ||
    lower.includes('statin') ||
    lower.includes('antibiotic') ||
    lower.includes('aspirin') ||
    lower.includes('heparin') ||
    lower.includes('insulin') ||
    lower.includes('steroid') ||
    lower.includes('dose') ||
    lower.includes('drug')
  ) {
    return { nodeType: 'drug', edgeType: 'treated-with' };
  }

  if (
    lower.includes('ecg') ||
    lower.includes('ekg') ||
    lower.includes('ct') ||
    lower.includes('mri') ||
    lower.includes('x-ray') ||
    lower.includes('echo') ||
    lower.includes('biopsy') ||
    lower.includes('blood') ||
    lower.includes('panel') ||
    lower.includes('troponin') ||
    lower.includes('bnp') ||
    lower.includes('crp') ||
    lower.includes('pcr') ||
    lower.includes('culture') ||
    lower.includes('score') ||
    lower.includes('ultrasound')
  ) {
    return { nodeType: 'investigation', edgeType: 'diagnosed-by' };
  }

  if (
    lower.includes('pain') ||
    lower.includes('fever') ||
    lower.includes('dyspnea') ||
    lower.includes('orthopnea') ||
    lower.includes('edema') ||
    lower.includes('rash') ||
    lower.includes('cough') ||
    lower.includes('tachycardia') ||
    lower.includes('hypotension') ||
    lower.includes('murmur')
  ) {
    return { nodeType: 'finding', edgeType: 'presents-with' };
  }

  if (parentSectionType === 'treatment') {
    return { nodeType: 'treatment', edgeType: 'treated-with' };
  }
  if (parentSectionType === 'investigation') {
    return { nodeType: 'investigation', edgeType: 'diagnosed-by' };
  }
  if (parentSectionType === 'red-flag') {
    return { nodeType: 'red-flag', edgeType: 'complicated-by' };
  }

  return { nodeType: 'concept', edgeType: 'related-to' };
}

function extractConceptsFromContent(
  content: string,
  sectionType: KnowledgeNodeType
): Array<{ label: string; summary?: string; type: KnowledgeNodeType; edgeType: KnowledgeEdgeType }> {
  const concepts: Array<{
    label: string;
    summary?: string;
    type: KnowledgeNodeType;
    edgeType: KnowledgeEdgeType;
  }> = [];

  if (!content) return concepts;

  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect bullet points or structured keys
    const isBullet = /^[•\-\*]\s+/.test(trimmed) || /^\d+[\.\)]\s+/.test(trimmed);
    const isBoldKey = /^\*\*([^*]+)\*\*/.test(trimmed);

    if (isBullet || isBoldKey) {
      let rawLabel = '';
      let rawSummary = '';

      if (isBoldKey) {
        const match = trimmed.match(/^\*\*([^*]+)\*\*(.*)/);
        if (match) {
          rawLabel = match[1].replace(/[:\-]$/, '').trim();
          rawSummary = match[2].replace(/^[:\-\s]+/, '').trim();
        }
      } else {
        const cleaned = trimmed.replace(/^[•\-\*]\s+/, '').replace(/^\d+[\.\)]\s+/, '').trim();
        const parts = cleaned.split(/[:–—]/);
        if (parts.length > 1 && parts[0].trim().length <= 40) {
          rawLabel = parts[0].trim();
          rawSummary = parts.slice(1).join(':').trim();
        } else {
          // Take first few words up to punctuation
          const sentenceEnd = cleaned.indexOf('.');
          if (sentenceEnd > 0 && sentenceEnd <= 45) {
            rawLabel = cleaned.slice(0, sentenceEnd).trim();
            rawSummary = cleaned.slice(sentenceEnd + 1).trim();
          } else {
            rawLabel = cleaned.slice(0, 40).trim();
            rawSummary = cleaned;
          }
        }
      }

      // Clean label
      const cleanLabel = rawLabel
        .replace(/[*_`#]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanLabel.length >= 3 && cleanLabel.length <= 50) {
        const { nodeType, edgeType } = inferConceptType(cleanLabel, sectionType);
        const cleanSummary = rawSummary
          ? rawSummary.replace(/[*_`#]/g, '').trim()
          : undefined;

        concepts.push({
          label: cleanLabel,
          summary: cleanSummary || undefined,
          type: nodeType,
          edgeType,
        });

        // Max 4 concepts per section for clean mobile layout
        if (concepts.length >= 4) break;
      }
    }
  }

  return concepts;
}

export function buildTopicGraph(params: {
  specialty?: SpecialtyData | { id: string; name?: string; scientificName?: string };
  topic: TopicItem;
}): KnowledgeMapGraph {
  const { specialty, topic } = params;
  const rootId = slugify(topic.id);
  const specId = specialty?.id || 'general';
  const specName = specialty
    ? (specialty as SpecialtyData).scientificName || (specialty as SpecialtyData).name || specialty.id
    : undefined;

  const nodes: KnowledgeMapNode[] = [];
  const edges: KnowledgeMapEdge[] = [];

  // 1. Root Node
  nodes.push({
    id: rootId,
    label: topic.title,
    type: 'root',
    summary: topic.subtitle || topic.aiScopeDescription || `${topic.title} clinical reference map.`,
    depth: 0,
    specialtyId: specId,
    topicId: topic.id,
    selectable: true,
    priority: 'primary',
  });

  // 2. Sections & Child Concepts
  const clinicalSections = topic.clinicalContent || [];

  if (clinicalSections.length > 0) {
    clinicalSections.forEach((section, sIdx) => {
      // Clean section title
      const cleanTitle = section.title
        .replace(/^[0-9]+[\.\)]\s*/, '')
        .replace(/[*_`#]/g, '')
        .trim();

      const { nodeType: secNodeType, edgeType: secEdgeType } = inferSectionType(cleanTitle);
      const sectionId = `${rootId}-${slugify(cleanTitle)}`;

      nodes.push({
        id: sectionId,
        label: cleanTitle,
        type: secNodeType,
        summary: section.content ? section.content.slice(0, 180).trim() + '...' : undefined,
        sourceId: String(sIdx),
        parentId: rootId,
        depth: 1,
        specialtyId: specId,
        topicId: topic.id,
        selectable: true,
        priority: 'secondary',
      });

      edges.push({
        id: `e-${rootId}-${sectionId}`,
        source: rootId,
        target: sectionId,
        type: secEdgeType,
        sourceId: String(sIdx),
      });

      // Extract child concepts from this section
      const extractedConcepts = extractConceptsFromContent(section.content, secNodeType);

      extractedConcepts.forEach((concept, cIdx) => {
        const conceptId = `${sectionId}-${slugify(concept.label)}`;

        nodes.push({
          id: conceptId,
          label: concept.label,
          type: concept.type,
          summary: concept.summary,
          sourceId: String(sIdx),
          parentId: sectionId,
          depth: 2,
          specialtyId: specId,
          topicId: topic.id,
          selectable: true,
          priority: 'tertiary',
        });

        edges.push({
          id: `e-${sectionId}-${conceptId}`,
          source: sectionId,
          target: conceptId,
          type: concept.edgeType,
          sourceId: String(sIdx),
        });
      });
    });
  } else {
    // Fallback default sections if no structured clinicalContent
    const defaultSections = [
      { title: 'Clinical Assessment', type: 'investigation' as const, edge: 'diagnosed-by' as const },
      { title: 'Management Protocol', type: 'treatment' as const, edge: 'treated-with' as const },
      { title: 'Red Flags & Risks', type: 'red-flag' as const, edge: 'complicated-by' as const },
    ];

    defaultSections.forEach((ds) => {
      const secId = `${rootId}-${slugify(ds.title)}`;
      nodes.push({
        id: secId,
        label: ds.title,
        type: ds.type,
        summary: `${ds.title} for ${topic.title}.`,
        parentId: rootId,
        depth: 1,
        specialtyId: specId,
        topicId: topic.id,
        selectable: true,
      });

      edges.push({
        id: `e-${rootId}-${secId}`,
        source: rootId,
        target: secId,
        type: ds.edge,
      });
    });
  }

  return normalizeKnowledgeGraph({
    id: `${specId}-${rootId}`,
    rootNodeId: rootId,
    specialtyId: specId,
    specialtyName: specName,
    topicId: topic.id,
    topicName: topic.title,
    generatedAt: new Date().toISOString(),
    version: 1,
    source: 'topic-guide',
    isExpandable: true,
    nodes,
    edges,
  });
}
