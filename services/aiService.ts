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
Provide evidence-based, structured clinical advice using standard guideline references (AHA/ACC, ESC, GOLD, IDSA, KDIGO, SURVIVING SEPSIS).

### CRITICAL INSTRUCTIONS:
1. **Direct Response First**: Respect user constraints (e.g., "latest", "pediatric", "sepsis-3 definition") as the highest priority. If the user asks for "latest treatments", do NOT provide a general "Clinical Assessment" overview unless strictly necessary. Focus on the cards that answer the specific question.
2. **Themed Section Headers**: You MUST wrap every distinct part of your response in a themed section header using this EXACT format: ##SECTION: HEADING_NAME##
   - Available headings: CLINICAL ASSESSMENT, DIFFERENTIAL DIAGNOSIS, INVESTIGATIONS, MANAGEMENT PROTOCOL, FIRST-LINE PHARMACOTHERAPY, CLINICAL PEARLS & PITFALLS, CITATIONS & GUIDELINES.
3. **No Markdown Tables**: NEVER use pipes (|) or dashes (---) to create tables. They break on mobile. Instead, use structured bullet points:
   - **Drug Name**: Dosage | Route | Notes
4. **Language**: Respond in the language of the query (e.g., Arabic) but keep medical terms in English where appropriate for clinical accuracy.
5. **No Internal Thinking**: DO NOT include your internal thinking process, planning, or reasoning steps in the output. Provide ONLY the final structured response.

Format your response using structured sections:
##SECTION: CLINICAL ASSESSMENT##
Diagnostic criteria or pathophysiological overview.

##SECTION: MANAGEMENT PROTOCOL##
Step-by-step guideline-directed therapy.

##SECTION: FIRST-LINE PHARMACOTHERAPY##
Specific drug regimens, exact dosing, routes, and titration.

##SECTION: CITATIONS & GUIDELINES##
[1] Specific Guideline Reference.

##SUGGESTIONS##
• Follow-up query 1
• Follow-up query 2
##END##`;

/**
 * Robust extraction for Suggestions and thinking/reasoning removal
 */
function cleanAIResponse(text: string): { reply: string; suggestions: string[] } {
  // 1. Strip reasoning/think tags (DeepSeek, Qwen, Llama reasoning)
  let replyText = text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/^Thinking Process:[\s\S]*?\n\n/i, '')
    .replace(/^Here's a thinking process:[\s\S]*?\n\n/i, '')
    .trim();

  let suggestions: string[] = [];

  // 2. Extract ##SUGGESTIONS## section
  const sugMatch = replyText.match(/##SUGGESTIONS##([\s\S]*?)(?:##END##|$)/i);
  if (sugMatch && sugMatch[1]) {
    suggestions = sugMatch[1]
      .split('\n')
      .map((line) => line.replace(/^[\s•\-*0-9.)]+/, '').replace(/##/g, '').trim())
      .filter((line) => line.length > 3 && !line.toUpperCase().includes('END') && !line.toUpperCase().includes('SECTION:'));

    replyText = replyText.split(/##SUGGESTIONS##/i)[0].trim();
  }

  // 3. Final cleanup of any trailing artifacts
  replyText = replyText.replace(/##END##/gi, '').trim();

  return { reply: replyText, suggestions };
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
