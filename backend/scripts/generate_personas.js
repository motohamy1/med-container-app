require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ensure script is run from the backend root or adjust paths if necessary
// In our case we are running it from `backend` so path is `.env`
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: SUPABASE_URL or SUPABASE_KEY is missing in backend/.env');
  process.exit(1);
}

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PASTE_YOUR_GEMINI_KEY_HERE') {
  console.error('CRITICAL: GEMINI_API_KEY is missing in backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

// We added a 1-second delay between calls to respect Gemini rate limits
const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function generateScope(prompt) {
  try {
    const result = await aiModel.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("AI Generation Error:", error.message);
    return null;
  }
}

async function run() {
  console.log("Starting Auto-Persona Generation...");

  // 1. Process Specialties (general_scope)
  console.log("\n--- Processing Specialties ---");
  const { data: specialties, error: specError } = await supabase.from('specialties').select('*');
  
  if (specError) {
    console.error("Error fetching specialties:", specError);
    return;
  }

  for (const specialty of specialties) {
    if (!specialty.general_scope || specialty.general_scope.trim() === '') {
      console.log(`Generating overarching scope for Specialty: ${specialty.name} (${specialty.scientific_name})`);
      
      const prompt = `You are an expert prompt engineer. Write a strict, 1-2 sentence overarching persona instruction for a medical AI consultant specializing in "${specialty.name}" (${specialty.scientific_name}). Tell the AI what domain it strictly covers. 
Example: "You are a Senior Cardiology Consultant. Focus exclusively on the cardiovascular system, heart diseases, vascular conditions, ECGs, and cardiac interventions."
Return ONLY the instruction text, no quotes or conversational filler.`;

      const generatedScope = await generateScope(prompt);
      
      if (generatedScope) {
        console.log(` -> Result: ${generatedScope}`);
        await supabase
          .from('specialties')
          .update({ general_scope: generatedScope })
          .eq('id', specialty.id);
      }
      await delay(1000); // rate limiting
    } else {
      console.log(`Specialty ${specialty.name} already has a general_scope. Skipping.`);
    }
  }

  // 2. Process Topics (ai_scope_description)
  console.log("\n--- Processing Topics ---");
  const { data: topics, error: topicError } = await supabase
    .from('topics')
    .select('id, title, specialty_id, ai_scope_description');

  if (topicError) {
    console.error("Error fetching topics:", topicError);
    return;
  }

  // Join categories or specialties for context if needed, but we have specialty_id
  const specMap = specialties.reduce((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
  }, {});

  for (const topic of topics) {
    if (!topic.ai_scope_description || topic.ai_scope_description.trim() === '') {
      const parentSpec = specMap[topic.specialty_id];
      const specName = parentSpec ? parentSpec.scientific_name : 'Medicine';

      console.log(`Generating AI scope for Topic: [${topic.id}] ${topic.title} (Specialty: ${specName})`);
      
      const prompt = `You are an expert prompt engineer. Write a strict, 1-2 sentence AI persona instruction for a medical AI acting as an expert in the topic of "${topic.title}" within the field of ${specName}. Tell the AI exactly what clinical guidelines, procedures, or conditions to strictly focus on for this topic. 
Example: "SPECIFIC FOCUS: Prioritize acute stabilization (ABCs), critical resuscitation protocols, time-sensitive interventions, and red flag warnings for emergencies. Respond with urgency and precision."
Return ONLY the instruction text, no quotes or conversational filler.`;

      const generatedScope = await generateScope(prompt);

      if (generatedScope) {
        console.log(` -> Result: ${generatedScope}`);
        await supabase
          .from('topics')
          .update({ ai_scope_description: generatedScope })
          .eq('id', topic.id);
      }
      await delay(1000); // rate limiting
    } else {
      // Uncomment if you want verbose skipping
      // console.log(`Topic ${topic.title} already has an ai_scope_description. Skipping.`);
    }
  }

  console.log("\n🎉 Auto-Persona Generation Complete!");
}

run();
