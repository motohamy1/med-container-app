const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const { searchCustomKnowledge } = require('./knowledgeService');
const { fetchClinicalLiterature } = require('./medicalSearchService');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const compilerModel = genAI
  ? genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0.1, // Near zero temperature for strict deterministic factual extraction
        responseMimeType: 'application/json',
      },
    })
  : null;

/**
 * Discovers potential clinical condition topics present inside an ingested text chunk or resource.
 */
async function discoverTopicsFromText(resourceTitle, resourceText) {
  if (!compilerModel) return [];

  const systemPrompt = `You are a Senior Medical Editor.
Analyze the provided medical textbook/guideline excerpt and identify distinct clinical topics, diseases, acute conditions, diagnostic scoring tools, or clinical protocols covered in the text.
Output ONLY a JSON array of objects conforming to this schema:
[
  {
    "id": "kebab-case-topic-id",
    "title": "Full Official Medical Title",
    "subtitle": "High-Yield Clinical Subtitle (e.g. Workup, Dosing & Criteria)",
    "type": "Emergency Protocol" | "Clinical Guideline" | "Diagnostic Tool" | "Trial & Evidence",
    "category_id": "emergencies" | "clinical_topics" | "tools" | "research",
    "specialty_id": "heart" | "git" | "fever" | "neuro" | "skin" | "gynacology" | "lungs"
  }
]
Do NOT hallucinate outside topics. Only list entities directly discussed in the text.`;

  const userPrompt = `Source Reference: "${resourceTitle}"\n\nExcerpt:\n${resourceText.substring(0, 40000)}`;

  try {
    const result = await compilerModel.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);
    const parsed = JSON.parse(result.response.text().trim());
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[TopicMiner] Failed to discover topics:', err.message);
    return [];
  }
}

/**
 * Compiles a structured, physician-grade topic strictly from retrieved reference chunks.
 */
async function compileTopicFromReferences(topicInfo, referenceChunks, resourceTitle) {
  if (!compilerModel) return null;

  const combinedReferenceText = referenceChunks
    .map((c, i) => `--- REFERENCE EXCERPT ${i + 1} [Source: ${c.title || resourceTitle || 'Medical Reference'}] ---\n${c.content || c.text || c}`)
    .join('\n\n');

  const systemPrompt = `You are a Strict Medical Compiler creating point-of-care clinical references for physicians, residents, and consultants.
MANDATORY RULES:
1. Ground every single claim, dosage, diagnostic criterion, and algorithm STRICTLY in the provided Reference Excerpts.
2. DO NOT use outside parametric memory or invent numbers. If a specific section (e.g. renal dosing) is not mentioned in the reference excerpts, write: "Not specified in current reference text."
3. Every section MUST include exact drug names, exact dosages (mg/kg or fixed dose), routes, frequencies, and red flag thresholds where documented.
4. Always include the "Exact Reference & Guideline Citations" section at the end with source attribution.

Output ONLY a JSON object with this exact schema:
{
  "id": "${topicInfo.id}",
  "title": "${topicInfo.title}",
  "subtitle": "${topicInfo.subtitle || 'Evidence-Based Clinical Protocol'}",
  "type": "${topicInfo.type || 'Clinical Guideline'}",
  "specialty_id": "${topicInfo.specialty_id}",
  "category_id": "${topicInfo.category_id}",
  "ai_scope_description": "Strict clinical scope for ${topicInfo.title}",
  "clinical_content": [
    { "title": "Immediate Triage & Red Flags", "content": "..." },
    { "title": "Diagnostic Criteria & Scoring Systems", "content": "..." },
    { "title": "First-Line Pharmacotherapy & Exact Dosing", "content": "..." },
    { "title": "Stepwise Management Algorithm", "content": "..." },
    { "title": "Clinical Pitfalls & Malpractice Warnings", "content": "..." },
    { "title": "Exact Reference & Guideline Citations", "content": "..." }
  ]
}`;

  const userPrompt = `Topic to compile: "${topicInfo.title}"
Specialty: ${topicInfo.specialty_id}
Category: ${topicInfo.category_id}

PROVIDED REFERENCE EXCERPTS:
${combinedReferenceText}`;

  try {
    const result = await compilerModel.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);
    const parsed = JSON.parse(result.response.text().trim());
    return parsed;
  } catch (err) {
    console.error(`[TopicMiner] Failed to compile topic ${topicInfo.title}:`, err.message);
    return null;
  }
}

/**
 * Full pipeline: Given an ingested resource, discover topics and compile them into Supabase topics table.
 */
async function extractAndCompileTopicsFromResource(resourceTitle, resourceText) {
  console.log(`[TopicMiner] Analyzing resource "${resourceTitle}" for clinical topics...`);
  const discovered = await discoverTopicsFromText(resourceTitle, resourceText);
  console.log(`[TopicMiner] Discovered ${discovered.length} potential topics in "${resourceTitle}".`);

  let compiledCount = 0;
  for (const topicMeta of discovered) {
    try {
      // 1. Retrieve most relevant reference chunks from custom_knowledge
      let chunks = await searchCustomKnowledge(topicMeta.title, 5, 0.4);
      if (!chunks || chunks.length === 0) {
        // Fallback to searching literature / resource text
        chunks = [{ title: resourceTitle, content: resourceText.substring(0, 15000) }];
      }

      // 2. Compile grounded topic
      const compiled = await compileTopicFromReferences(topicMeta, chunks, resourceTitle);
      if (compiled && compiled.clinical_content && compiled.clinical_content.length > 0) {
        // 3. Upsert to Supabase
        const record = {
          id: compiled.id,
          specialty_id: compiled.specialty_id,
          category_id: compiled.category_id,
          title: compiled.title,
          subtitle: compiled.subtitle,
          type: compiled.type,
          ai_scope_description: compiled.ai_scope_description,
          clinical_content: compiled.clinical_content,
        };

        const { error } = await supabase.from('topics').upsert(record);
        if (error) {
          console.warn(`[TopicMiner] Supabase upsert error for ${compiled.title}:`, error.message);
        } else {
          compiledCount++;
          console.log(`[TopicMiner] ✅ Compiled and saved reference topic: "${compiled.title}" (${compiled.specialty_id}/${compiled.category_id})`);
        }
      }
    } catch (topicErr) {
      console.error(`[TopicMiner] Error processing topic ${topicMeta.title}:`, topicErr.message);
    }
  }

  return compiledCount;
}

/**
 * On-Demand Reference Synthesis for a specific query / condition.
 */
async function synthesizeTopicOnDemand(specialtyId, categoryId, query) {
  console.log(`[TopicMiner] On-demand reference synthesis requested for "${query}" in ${specialtyId}...`);

  // 1. Search existing custom_knowledge vector store
  let chunks = await searchCustomKnowledge(query, 5, 0.4);

  // 2. If no matching chunks in local custom_knowledge, fetch from peer-reviewed literature (Europe PMC, FDA labels, ClinicalTrials)
  if (!chunks || chunks.length === 0) {
    console.log(`[TopicMiner] No local vector chunks found. Fetching from verified medical literature repositories...`);
    const lit = await fetchClinicalLiterature(query, specialtyId);
    if (lit && lit.length > 0) {
      chunks = lit.map(l => ({
        title: `${l.source} - ${l.title} (${l.year})`,
        content: `JOURNAL: ${l.journal}\nTYPE: ${l.type}\nABSTRACT / CONTENT:\n${l.abstract}`
      }));
    }
  }

  if (!chunks || chunks.length === 0) {
    return {
      error: `No verified medical references or guidelines found for "${query}". Please ingest the relevant guideline or textbook chapter in the Admin Panel.`
    };
  }

  const topicId = query.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const topicMeta = {
    id: topicId,
    title: query.charAt(0).toUpperCase() + query.slice(1),
    subtitle: 'Reference-Derived Clinical Protocol',
    type: categoryId === 'emergencies' ? 'Emergency Protocol' : categoryId === 'tools' ? 'Diagnostic Tool' : categoryId === 'research' ? 'Landmark Trial' : 'Clinical Guideline',
    specialty_id: specialtyId,
    category_id: categoryId || 'clinical_topics',
  };

  const compiled = await compileTopicFromReferences(topicMeta, chunks, chunks[0]?.title || 'Clinical Reference');
  if (compiled) {
    // Save to Supabase for permanent caching
    await supabase.from('topics').upsert({
      id: compiled.id,
      specialty_id: compiled.specialty_id,
      category_id: compiled.category_id,
      title: compiled.title,
      subtitle: compiled.subtitle,
      type: compiled.type,
      ai_scope_description: compiled.ai_scope_description,
      clinical_content: compiled.clinical_content,
    });
  }

  return compiled;
}

module.exports = {
  discoverTopicsFromText,
  compileTopicFromReferences,
  extractAndCompileTopicsFromResource,
  synthesizeTopicOnDemand,
};
