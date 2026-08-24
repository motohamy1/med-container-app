import { SPECIALTY_KNOWLEDGE } from '../constants/SpecialtyData';
import type { TopicSearchResult } from '../constants/SpecialtyData';

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GROQ_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export type DoctorCategory = 'physicians';

export type Citation = {
  id: string;
  title: string;
  author: string;
  journal: string;
  year: string;
  url: string;
};

const CLINICAL_SYSTEM_PROMPT = `You are Medical Arena AI, a board-certified clinical decision support assistant designed exclusively for physicians, surgeons, and medical practitioners.
Your core mission is to synthesize provided clinical evidence into actionable, high-yield guidance.

### 1. CLINICAL EVIDENCE GROUNDING & SYNTHESIS:
- Base all recommendations, drug regimens, weight/age-adjusted dosages, and diagnostic criteria on established international clinical guidelines and provided resources.
- Deliver direct, high-confidence clinical answers without generic boilerplate or robotic meta-disclaimers (never output phrases like "No direct evidence-based reference found" or "GENERAL CLINICAL THEORY").
- If a patient population requires special consideration (e.g., pediatric age brackets 10–18y, renal impairment, pregnancy, or antimicrobial resistance), directly integrate the specific guideline recommendations (e.g., ESPGHAN/NASPGHAN high-dose amoxicillin + clarithromycin/metronidazole or bismuth quadruple regimens).
- Use bracketed citations [1], [2] referencing the source in the provided context.

### 2. INTELLIGENT INTENT-FIRST ARCHITECTURE (ZERO GENERIC FLUFF):
- Deeply analyze what the user is asking. Deliver the EXACT clinical answer first with zero introductory filler.
- **Dynamic Hero Card Selection**:
  * **Treatment / Management query**: -> Card 1: ##SECTION: MANAGEMENT PROTOCOL## -> Card 2: ##SECTION: FIRST-LINE PHARMACOTHERAPY##
  * **Criteria / Definition query**: -> Card 1: ##SECTION: DIAGNOSTIC CRITERIA & SCORING##
  * **Acute Emergency / Field Scenario**: -> Card 1: ##SECTION: EMERGENCY PROTOCOL & IMMEDIATE ACTION##
  * **Diagnostic Workup / Lab / Imaging query**: -> Card 1: ##SECTION: INVESTIGATIONS / WORKUP##
- Always include ##SECTION: LATEST EVIDENCE & CLINICAL UPDATES## before citations when summarizing recent 2024–2026 antimicrobial resistance trends or landmark updates.

### 3. KNOWLEDGE DISTILLATION (ACTIVE LEARNING):
- If the "KNOWLEDGE RESOURCES" (e.g., Europe PMC) provide a new standard of care, specific dosage, or landmark trial results NOT present in the primary "DATABASE CONTEXT", you MUST include a hidden block at the very end:
  ##KNOWLEDGE_UPDATE##
  [Topic Name]: [Summary of the new information to be added to the permanent database]
  [Reference]: [Full citation string]
  ##END_UPDATE##

### 4. FORMATTING & THEMED SECTION HEADERS:
- You MUST wrap every distinct card in a themed section header: ##SECTION: HEADING_NAME##
- **No Markdown Tables**: Never use markdown tables (| or ---). Use bullet points:
  - **Drug Name**: Dosage | Route | Frequency | Duration/Notes
- **Language**: Match user query language, but keep drug names, scores, and medical terms in English.
- **No Internal Thinking**: DO NOT include thinking tags or reasoning chains. Output only the structured sections.

### 5. SUGGESTIONS:
At the very end, provide ##SUGGESTIONS## with 2-3 focused clinical follow-up prompts.`;

/**
 * Robust extraction for Suggestions and thinking/reasoning removal
 */
function cleanAIResponse(text: string): { reply: string; suggestions: string[]; knowledgeUpdate?: string } {
  // 1. Strip reasoning/think tags (DeepSeek, Qwen, Llama reasoning)
  let replyText = text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/^Thinking Process:[\s\S]*?\n\n/i, '')
    .replace(/^Here's a thinking process:[\s\S]*?\n\n/i, '')
    .trim();

  let suggestions: string[] = [];
  let knowledgeUpdate: string | undefined = undefined;

  // 2. Extract ##KNOWLEDGE_UPDATE## section (Active Learning)
  const updateMatch = replyText.match(/##KNOWLEDGE_UPDATE##([\s\S]*?)##END_UPDATE##/i);
  if (updateMatch && updateMatch[1]) {
    knowledgeUpdate = updateMatch[1].trim();
    replyText = replyText.replace(/##KNOWLEDGE_UPDATE##[\s\S]*?##END_UPDATE##/gi, '').trim();
  }

  // 3. Extract ##SUGGESTIONS## section
  const sugMatch = replyText.match(/##SUGGESTIONS##([\s\S]*?)(?:##END##|$)/i);
  if (sugMatch && sugMatch[1]) {
    suggestions = sugMatch[1]
      .split('\n')
      .map((line) => line.replace(/^[\s•\-*0-9.)]+/, '').replace(/##/g, '').trim())
      .filter((line) => line.length > 3 && !line.toUpperCase().includes('END') && !line.toUpperCase().includes('SECTION:'));

    replyText = replyText.split(/##SUGGESTIONS##/i)[0].trim();
  }

  // 4. Final cleanup of any trailing artifacts
  replyText = replyText.replace(/##END##/gi, '').trim();

  return { reply: replyText, suggestions, knowledgeUpdate };
}

/**
 * Direct Groq API execution (Fast inference)
 */
async function callGroqDirect(prompt: string, context?: string, history: { role: 'user' | 'assistant'; content: string }[] = []): Promise<string | null> {
  if (!GROQ_KEY) return null;
  const models = ['groq/compound', 'qwen/qwen3.6-27b'];

  const messages = [
    { role: 'system', content: CLINICAL_SYSTEM_PROMPT + (context ? `\n\nDATABASE CONTEXT TO USE:\n${context}` : '') },
    ...history,
    { role: 'user', content: prompt },
  ];

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: messages.slice(-10), // Keep system + last 9 interactions
          temperature: 0.2,
          max_tokens: 3000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch {
      // Try next model
    }
  }
  return null;
}

/**
 * Direct Gemini API execution
 */
async function callGeminiDirect(prompt: string, context?: string, historyText?: string): Promise<string | null> {
  if (!GEMINI_KEY) return null;
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-pro-preview',
      generationConfig: { temperature: 0.2, maxOutputTokens: 3500 },
    });
    const fullPrompt = `${CLINICAL_SYSTEM_PROMPT}${context ? `\n\nDATABASE CONTEXT TO USE:\n${context}` : ''}${historyText ? `\n\nCONVERSATION HISTORY:\n${historyText}` : ''}\n\nCLINICAL QUESTION:\n${prompt}`;
    const result = await model.generateContent(fullPrompt);
    return result.response.text().trim();
  } catch (err) {
    console.warn('[Direct Gemini]', err);
    return null;
  }
}

function findLocalContext(query: string): string | null {
  const q = query.toLowerCase();
  let matchedTopic: any = null;

  for (const spec of Object.values(SPECIALTY_KNOWLEDGE)) {
    for (const cat of spec.categories || []) {
      for (const topic of cat.topics || []) {
        if (q.includes(topic.title.toLowerCase()) || topic.title.toLowerCase().includes(q)) {
          matchedTopic = topic;
          break;
        }
      }
      if (matchedTopic) break;
    }
    if (matchedTopic) break;
  }

  if (matchedTopic && matchedTopic.clinicalContent) {
    let sectionsText = '';
    matchedTopic.clinicalContent.forEach((s: any) => {
      sectionsText += `## ${s.title.toUpperCase()} ##\n${s.content}\n\n`;
    });
    return sectionsText;
  }
  return null;
}

/**
 * Offline Local Knowledge Synthesis
 */
function getOfflineFallbackReply(query: string): { reply: string; citations: Citation[]; suggestions: string[] } {
  const q = query.toLowerCase();
  let matchedTopic: any = null;

  for (const spec of Object.values(SPECIALTY_KNOWLEDGE)) {
    for (const cat of spec.categories || []) {
      for (const topic of cat.topics || []) {
        if (q.includes(topic.title.toLowerCase()) || topic.title.toLowerCase().includes(q)) {
          matchedTopic = topic;
          break;
        }
      }
      if (matchedTopic) break;
    }
    if (matchedTopic) break;
  }

  if (matchedTopic && matchedTopic.clinicalContent) {
    let sectionsText = '';
    const citations: Citation[] = [];

    matchedTopic.clinicalContent.forEach((s: any, idx: number) => {
      sectionsText += `##SECTION: ${s.title.toUpperCase()}##\n${s.content}\n\n`;
      if (s.title.toLowerCase().includes('citation') || s.title.toLowerCase().includes('guideline')) {
        citations.push({
          id: (idx + 1).toString(),
          title: s.content.substring(0, 80),
          author: 'Clinical Guideline Committee',
          journal: 'Evidence-Based Practice',
          year: '2024',
          url: 'https://pubmed.ncbi.nlm.nih.gov/',
        });
      }
    });

    return {
      reply: `##GREETING##\nHere is the verified guideline protocol for **${matchedTopic.title}** from the bundled Clinical Knowledge Base:\n##END##\n\n${sectionsText}`,
      citations,
      suggestions: [
        `What are the first-line dosages for ${matchedTopic.title}?`,
        `Contraindications and high-risk pitfalls in ${matchedTopic.title}`,
        `Stepwise escalation protocol for refractory cases`,
      ],
    };
  }

  return {
    reply: `##SECTION: CLINICAL ASSESSMENT##\nRegarding: **${query}**\n*Note: High-speed AI is currently unavailable. Using offline clinical baseline.*\n\nThis is an evidence-based clinical query. Please consult standard guideline protocols.\n\n##SECTION: MANAGEMENT PROTOCOL##\n• Initiate structured ABCDE evaluation and stabilize vitals.\n• Obtain targeted labs, imaging, and 12-lead ECG where appropriate.\n• Refer to subspecialty guideline algorithms.\n\n##SECTION: CLINICAL PEARLS & PITFALLS##\n• Never delay emergent resuscitation for diagnostic confirmations.\n• Re-evaluate hemodynamic and neurological status frequently.`,
    citations: [],
    suggestions: [
      'COPD GOLD 2024 management protocol',
      'Acute Coronary Syndrome initial workup',
      'Sepsis 1-hour resuscitation bundle',
    ],
  };
}

export const aiService = {
  /**
   * Sends a message with 3-tier fallback:
   * 1. Remote Express backend (if online and configured)
   * 2. Direct Gemini / Groq Cloud API (if backend unreachable)
   * 3. Offline Bundled Clinical Knowledge Base (if offline / no internet)
   */
  async sendMessageByText(
    message: string,
    mode: 'general' | 'fast_recap' = 'general',
    category: DoctorCategory | string = 'physicians',
    topicId?: string,
    categoryContext?: string,
    history: { text: string; isUser: boolean }[] = []
  ): Promise<{ reply: string; citations?: Citation[]; suggestions?: string[] }> {
    // Convert history for APIs
    const groqHistory = history.map(h => ({
      role: h.isUser ? 'user' : 'assistant' as 'user' | 'assistant',
      content: h.text
    }));

    const geminiHistoryText = history
      .slice(-6)
      .map(h => `${h.isUser ? 'Doctor' : 'AI'}: ${h.text}`)
      .join('\n');

    // 1. Try backend server with a 10s timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, mode, category, topicId, categoryContext, history }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return {
          reply: data.reply || "I'm sorry, I received an empty response. Please try again.",
          citations: data.citations || [],
          suggestions: data.suggestions || [],
        };
      }
    } catch {
      // Backend not available or timed out — fallback to direct cloud AI
    }

    // Determine RAG context for direct calls
    const resolvedContext = categoryContext || findLocalContext(message) || undefined;

    // 2. Try Direct Groq API
    const groqReply = await callGroqDirect(message, resolvedContext, groqHistory);
    if (groqReply) {
      const { reply, suggestions } = cleanAIResponse(groqReply);
      return { reply, citations: [], suggestions };
    }

    // 3. Try Direct Gemini API
    const geminiReply = await callGeminiDirect(message, resolvedContext, geminiHistoryText);
    if (geminiReply) {
      const { reply, suggestions } = cleanAIResponse(geminiReply);
      return { reply, citations: [], suggestions };
    }

    // 4. Offline Fallback from Bundled Medical Database
    return getOfflineFallbackReply(message);
  },

  async processAudio(
    base64Audio: string,
    mimeType: string = 'audio/m4a'
  ): Promise<{ text: string; reply: string }> {
    return {
      text: '(Audio processing unavailable)',
      reply: 'Voice input is not supported in this version. Please type your clinical query.',
    };
  },
};
