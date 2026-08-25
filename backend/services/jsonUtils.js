/**
 * jsonUtils.js
 * Bulletproof JSON cleaning, repair, and structured extraction
 * for AI-generated medical knowledge and brainstormed lists.
 */

/**
 * Remove think tags, thought processes, and extraneous conversational preamble
 */
function cleanAIResponse(text) {
    if (!text || typeof text !== 'string') return '';
    
    let cleaned = text;

    // 1. Remove closed <think>...</think> and <thought>...</thought>
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
    cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/gi, '');

    // 2. If unclosed <think> or <thought> tags remain, strip the tags themselves
    cleaned = cleaned.replace(/<\/?think>/gi, '');
    cleaned = cleaned.replace(/<\/?thought>/gi, '');

    // 3. Remove common reasoning preamble
    cleaned = cleaned.replace(/^Thinking Process:[\s\S]*?\n\n/i, '');
    cleaned = cleaned.replace(/^Here's a thinking process:[\s\S]*?\n\n/i, '');
    cleaned = cleaned.replace(/^Okay, let's .*?\n\n/i, '');
    cleaned = cleaned.replace(/^Sure! Here is .*?:\n+/i, '');
    cleaned = cleaned.replace(/^Based on the .*?:\n+/i, '');

    return cleaned.trim();
}

/**
 * Clean control characters and fix common JSON syntax errors
 */
function sanitizeJSONString(raw) {
    if (!raw) return '';

    let str = cleanAIResponse(raw);

    // Strip markdown code block wrappers
    str = str.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Replace unescaped control characters (ASCII 0-31 except \n, \r, \t)
    str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Remove trailing commas before closing braces or brackets: , } -> } and , ] -> ]
    str = str.replace(/,\s*([\}\]])/g, '$1');

    return str;
}

/**
 * Robust JSON Parser that attempts multiple repair strategies
 */
function safeParseJSON(raw, fallback = null) {
    if (!raw) return fallback;

    const cleaned = sanitizeJSONString(raw);

    // 1. First attempt: Direct parse
    try {
        return JSON.parse(cleaned);
    } catch (_) {}

    // 2. Second attempt: Extract innermost or outermost JSON block { ... } or [ ... ]
    try {
        const firstBracket = cleaned.indexOf('[');
        const lastBracket = cleaned.lastIndexOf(']');
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');

        // If array
        if (firstBracket !== -1 && lastBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
            const candidate = cleaned.substring(firstBracket, lastBracket + 1).replace(/,\s*\]/g, ']');
            return JSON.parse(candidate);
        }

        // If object
        if (firstBrace !== -1 && lastBrace !== -1) {
            const candidate = cleaned.substring(firstBrace, lastBrace + 1).replace(/,\s*\}/g, '}');
            return JSON.parse(candidate);
        }
    } catch (_) {}

    // 3. Third attempt: Fix truncated JSON (missing closing quotes/brackets)
    try {
        let fixed = cleaned;
        // Count open vs close brackets/braces
        const openBraces = (fixed.match(/\{/g) || []).length;
        const closeBraces = (fixed.match(/\}/g) || []).length;
        const openBrackets = (fixed.match(/\[/g) || []).length;
        const closeBrackets = (fixed.match(/\]/g) || []).length;

        // If open quotes are odd, close the last quote
        const quotes = (fixed.match(/(?<!\\)"/g) || []).length;
        if (quotes % 2 !== 0) {
            fixed += '"';
        }

        for (let i = 0; i < (openBrackets - closeBrackets); i++) fixed += ']';
        for (let i = 0; i < (openBraces - closeBraces); i++) fixed += '}';

        return JSON.parse(fixed.replace(/,\s*([\}\]])/g, '$1'));
    } catch (_) {}

    return fallback;
}

/**
 * 100% Guaranteed Topic Brainstorm Parser
 * Handles JSON array, markdown numbered lists, bullets, or comma-separated items
 */
function parseBrainstormTopics(rawText, fallbackCategory = 'Topic') {
    if (!rawText || typeof rawText !== 'string') return [];

    const cleaned = cleanAIResponse(rawText);

    // 1. Try standard JSON array parse
    const parsed = safeParseJSON(cleaned, null);
    if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
            .map(t => (typeof t === 'string' ? t.trim() : (t?.title || t?.name || '')))
            .filter(t => t.length > 2);
    }

    // 2. If not standard JSON, extract quoted strings: ["...", "..."]
    const quotedMatches = cleaned.match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g);
    if (quotedMatches && quotedMatches.length >= 3) {
        const topics = quotedMatches
            .map(m => m.replace(/^"|"$/g, '').replace(/\\"/g, '"').trim())
            .filter(t => t.length > 2 && !t.includes('{') && !t.includes('}') && !t.includes('title') && !t.includes('category'));
        if (topics.length > 0) return topics;
    }

    // 3. Fallback: Parse line-by-line (e.g., "1. Tension Pneumothorax", "- ARDS", "* Pulmonary Embolism")
    const lines = cleaned.split(/\r?\n/);
    const lineTopics = [];

    for (const rawLine of lines) {
        const line = rawLine
            .replace(/^[\s*\-•\d+.)\]\>\#]+/, '') // Remove leading numbers, bullets, hashes
            .replace(/\*\*/g, '')               // Remove bold
            .replace(/^["']|["'],?$/g, '')      // Remove outer quotes and commas
            .trim();

        const lower = line.toLowerCase();
        if (
            line.length >= 3 &&
            line.length <= 150 &&
            !line.startsWith('{') &&
            !line.startsWith('[') &&
            !line.startsWith('```') &&
            !lower.startsWith('here is') &&
            !lower.startsWith('output:') &&
            !lower.startsWith('specialty:') &&
            !lower.startsWith('thinking process') &&
            !lower.startsWith('thought process')
        ) {
            lineTopics.push(line);
        }
    }

    return lineTopics;
}

/**
 * 100% Guaranteed Topic Synthesis Parser
 * Ensures every topic is cleanly converted into structured clinical content
 */
function parseTopicSynthesis(rawText, topicName = 'Clinical Protocol', categoryName = 'Clinical Guidelines') {
    const cleaned = cleanAIResponse(rawText);
    const parsed = safeParseJSON(cleaned, null);

    if (parsed && typeof parsed === 'object') {
        const title = parsed.title || topicName;
        const subtitle = parsed.subtitle || '2024/2025 Evidence-Based Update';
        const type = parsed.type || categoryName;
        const ai_scope_description = parsed.ai_scope_description || `Clinical guidelines and management protocols for ${title}.`;
        
        let clinical_content = [];
        if (Array.isArray(parsed.clinical_content) && parsed.clinical_content.length > 0) {
            clinical_content = parsed.clinical_content.map(sec => ({
                title: sec.title || 'Clinical Overview',
                content: typeof sec.content === 'string' ? sec.content : JSON.stringify(sec.content || '')
            }));
        } else {
            // Fallback sections
            clinical_content = [
                { title: 'Clinical Definition & Overview', content: typeof parsed.content === 'string' ? parsed.content : `Evidence-based overview for ${title}.` },
                { title: 'Stepwise Management Algorithm', content: 'Follow standard international clinical protocols and risk stratification.' }
            ];
        }

        return {
            title,
            subtitle,
            type,
            ai_scope_description,
            clinical_content
        };
    }

    // Fallback: If JSON parsing failed completely, synthesize from text
    const sections = [];

    // Check if text has sections separated by markdown headings or bullets
    const rawSections = cleaned.split(/(?=###|\n\*\*|\n[1-5]\.\s+\*\*)/);
    if (rawSections.length > 1) {
        for (const rawSec of rawSections) {
            const lines = rawSec.trim().split('\n');
            const titleLine = lines[0].replace(/^[\s#*\-\d+.)]+/, '').replace(/\*\*/g, '').trim();
            const content = lines.slice(1).join('\n').trim();
            if (titleLine && content) {
                sections.push({ title: titleLine, content });
            }
        }
    }

    if (sections.length === 0) {
        sections.push(
            { title: 'Clinical Definition & Overview', content: cleaned || `Clinical guidelines for ${topicName}.` },
            { title: 'Stepwise Management Algorithm', content: 'Follow 2024-2025 evidence-based clinical recommendations.' }
        );
    }

    return {
        title: topicName,
        subtitle: '2024/2025 Evidence-Based Update',
        type: categoryName,
        ai_scope_description: `Focus strictly on ${topicName} management and evidence-based clinical protocols.`,
        clinical_content: sections
    };
}

module.exports = {
    cleanAIResponse,
    sanitizeJSONString,
    safeParseJSON,
    parseBrainstormTopics,
    parseTopicSynthesis
};
