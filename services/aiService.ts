import { GoogleGenerativeAI } from '@google/generative-ai';
import { SPECIALTY_KNOWLEDGE, TopicSearchResult } from '../constants/SpecialtyData';

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

Format your response using structured sections:
##SECTION: CLINICAL ASSESSMENT##
Brief pathophysiological overview and diagnostic criteria.

##SECTION: DIFFERENTIAL DIAGNOSIS##
Key differentials to consider.

##SECTION: MANAGEMENT PROTOCOL##
Step-by-step guideline-directed medical therapy.

##SECTION: FIRST-LINE PHARMACOTHERAPY##
Specific drug regimens, exact dosing, routes, and titration.

##SECTION: CLINICAL PEARLS & PITFALLS##
Critical warnings, malpractice traps, and contraindicated combinations.

##SECTION: CITATIONS & GUIDELINES##
[1] Guideline or Clinical Reference Trial.

##SUGGESTIONS##
• Follow-up query 1
• Follow-up query 2
• Follow-up query 3
##END##`;

/**
 * Direct Groq API execution (Fast inference)
 */
async function callGroqDirect(prompt: string): Promise<string | null> {
  if (!GROQ_KEY) return null;
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

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
          messages: [
            { role: 'system', content: CLINICAL_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 3000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) {
          return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        }
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
async function callGeminiDirect(prompt: string): Promise<string | null> {
  if (!GEMINI_KEY) return null;
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0.2, maxOutputTokens: 3500 },
    });
    const fullPrompt = `${CLINICAL_SYSTEM_PROMPT}\n\nCLINICAL QUESTION:\n${prompt}`;
    const result = await model.generateContent(fullPrompt);
    return result.response.text().trim();
  } catch (err) {
    console.warn('[Direct Gemini]', err);
    return null;
  }
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
    reply: `##SECTION: CLINICAL ASSESSMENT##\nRegarding: **${query}**\nThis is an evidence-based clinical query. Please consult standard guideline protocols.\n\n##SECTION: MANAGEMENT PROTOCOL##\n• Initiate structured ABCDE evaluation and stabilize vitals.\n• Obtain targeted labs, imaging, and 12-lead ECG where appropriate.\n• Refer to subspecialty guideline algorithms.\n\n##SECTION: CLINICAL PEARLS & PITFALLS##\n• Never delay emergent resuscitation for diagnostic confirmations.\n• Re-evaluate hemodynamic and neurological status frequently.`,
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
    categoryContext?: string
  ): Promise<{ reply: string; citations?: Citation[]; suggestions?: string[] }> {
    // 1. Try backend server with a 3.5s timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, mode, category, topicId, categoryContext }),
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

    // 2. Try Direct Groq API
    const groqReply = await callGroqDirect(message);
    if (groqReply) {
      let suggestions: string[] = [];
      let replyText = groqReply;
      const sugMatch = groqReply.match(/##SUGGESTIONS##([\s\S]*?)(?:##END##|$)/i);
      if (sugMatch && sugMatch[1]) {
        suggestions = sugMatch[1]
          .split('\n')
          .map((line) => line.replace(/^[\s•\-*0-9.)]+/, '').replace(/##/g, '').trim())
          .filter((line) => line.length > 4 && !line.toUpperCase().includes('END'));
        replyText = groqReply.replace(/##SUGGESTIONS##[\s\S]*?(?:##END##|$)/gi, '').trim();
      }
      return { reply: replyText, citations: [], suggestions };
    }

    // 3. Try Direct Gemini API
    const geminiReply = await callGeminiDirect(message);
    if (geminiReply) {
      let suggestions: string[] = [];
      let replyText = geminiReply;
      const sugMatch = geminiReply.match(/##SUGGESTIONS##([\s\S]*?)(?:##END##|$)/i);
      if (sugMatch && sugMatch[1]) {
        suggestions = sugMatch[1]
          .split('\n')
          .map((line) => line.replace(/^[\s•\-*0-9.)]+/, '').replace(/##/g, '').trim())
          .filter((line) => line.length > 4 && !line.toUpperCase().includes('END'));
        replyText = geminiReply.replace(/##SUGGESTIONS##[\s\S]*?(?:##END##|$)/gi, '').trim();
      }
      return { reply: replyText, citations: [], suggestions };
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
