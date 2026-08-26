const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const TARGET = 52;

async function finishLungsResearch() {
  const { count } = await supabase
    .from('topics')
    .select('*', { count: 'exact', head: true })
    .eq('specialty_id', 'lungs')
    .eq('category_id', 'research');

  let currentCount = count || 0;
  console.log(`Current lungs -> research count: ${currentCount} / ${TARGET}`);

  const { data: rows } = await supabase
    .from('topics')
    .select('title')
    .eq('specialty_id', 'lungs')
    .eq('category_id', 'research');

  const existing = new Set((rows || []).map(r => r.title.toLowerCase().trim()));

  const systemPrompt = `You are a Chief of Pulmonology & Medical Research Editor. Output pure JSON only:
{
  "topics": [
    {
      "title": "Clear Trial / Research Title",
      "subtitle": "Landmark Trial Acronym and Primary Endpoint",
      "type": "Trial & Evidence",
      "ai_scope_description": "Strict clinical focus summary",
      "clinical_content": [
        { "title": "Trial Design & Study Population", "content": "Key design, sample size, primary endpoints" },
        { "title": "Primary & Secondary Outcomes", "content": "Exact statistical hazard ratios, p-values, mortality benefit" },
        { "title": "Clinical Practice Recommendations", "content": "How this trial alters current clinical practice and guideline recommendations" },
        { "title": "Guideline Citation", "content": "Journal citation, DOI/PMID, and year" }
      ]
    }
  ]
}`;

  while (currentCount < TARGET) {
    const needed = TARGET - currentCount;
    const batchSize = Math.min(6, needed);
    const existingList = Array.from(existing).slice(-15).join(', ');

    console.log(`⚡ Generating ${batchSize} pulmonary landmark research topics (Remaining needed: ${needed})...`);

    const userPrompt = `Generate exactly ${batchSize} DISTINCT landmark clinical trials & breakthrough research in Pulmonology & Respiratory Medicine (e.g. Dupilumab for COPD with type 2 inflammation, Sotatercept in STELLAR trial, Nintedanib in INBUILD trial, Siltuximab in Castleman, Ensifentrine in ENHANCE trials, Tezepelumab in NAVIGATOR).
Avoid duplicating: ${existingList || 'None'}.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 3500
      })
    });

    const d = await res.json();
    let text = d.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    text = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const firstB = text.indexOf('{');
    const lastB = text.lastIndexOf('}');
    if (firstB !== -1 && lastB !== -1) text = text.substring(firstB, lastB + 1);

    const parsed = JSON.parse(text);
    const topics = parsed.topics || [];

    for (const t of topics) {
      if (!t.title) continue;
      const norm = t.title.toLowerCase().trim();
      if (existing.has(norm)) continue;

      const slug = `lungs_research_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const record = {
        id: slug,
        specialty_id: 'lungs',
        category_id: 'research',
        title: t.title,
        subtitle: t.subtitle || '',
        type: 'Trial & Evidence',
        ai_scope_description: t.ai_scope_description || t.title,
        clinical_content: t.clinical_content || []
      };

      await supabase.from('topics').insert(record);
      try {
        await supabase.from('specialty_topics').upsert({
          specialty_id: 'lungs',
          category_id: 'research',
          topic_id: slug,
          title: record.title,
          subtitle: record.subtitle,
          type: record.type,
          ai_scope_description: record.ai_scope_description,
          clinical_content: record.clinical_content,
          updated_at: new Date().toISOString()
        }, { onConflict: 'specialty_id,topic_id' });
      } catch (_) {}

      existing.add(norm);
      currentCount++;
      console.log(`   💾 [${currentCount}/${TARGET}] Saved: ${t.title}`);
    }

    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`\n🎉 [Pulmonology Research] Successfully completed with ${currentCount} topics!`);
}

finishLungsResearch();
