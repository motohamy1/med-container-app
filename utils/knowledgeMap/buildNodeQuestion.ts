import { KnowledgeMapNode } from '../../types/knowledgeMap';

export interface QuestionContext {
  topicName?: string;
  specialtyName?: string;
  parentLabel?: string;
}

export function buildNodeQuestion(
  node: KnowledgeMapNode,
  context?: QuestionContext
): string {
  const topicName = context?.topicName || node.topicId || 'this condition';
  const label = node.label.trim();

  if (node.type === 'root') {
    return `What are the key clinical guidelines, diagnostic criteria, and management protocols for ${topicName}?`;
  }

  switch (node.type) {
    case 'treatment':
      return `What is the role and protocol of ${label} in the management of ${topicName}?`;
    case 'drug':
      return `What is the recommended dosing, indications, and contraindications for ${label} in ${topicName}?`;
    case 'investigation':
      return `Explain the diagnostic role, timing, and clinical interpretation of ${label} in ${topicName}.`;
    case 'finding':
      return `What is the clinical significance and presentation of ${label} in ${topicName}?`;
    case 'complication':
      return `What are the risk factors, early signs, and management strategies for ${label} in ${topicName}?`;
    case 'red-flag':
      return `What is the immediate emergency action and protocol for ${label} in ${topicName}?`;
    case 'section':
      return `Provide a focused clinical breakdown of ${label} for ${topicName}.`;
    case 'citation':
      return `What evidence and clinical trial data support ${label} in ${topicName}?`;
    case 'question':
      return label.endsWith('?') ? label : `${label}?`;
    case 'concept':
    default:
      if (context?.parentLabel && context.parentLabel !== topicName) {
        return `Explain ${label} regarding ${context.parentLabel} in the context of ${topicName}.`;
      }
      return `Explain ${label} in the context of ${topicName}.`;
  }
}
