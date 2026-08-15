const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// We need to parse SpecialtyData.ts. Since it has `require()`, we will strip them out.
const filePath = 'constants/SpecialtyData.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Strip out imports and typescript types
content = content.replace(/import .*?;\n/g, '');
content = content.replace(/export type .*? = \{[\s\S]*?\};\n/g, '');

// Strip requires
content = content.replace(/require\([^)]*\)/g, 'null');

// Extract the SPECIALTY_KNOWLEDGE object
const objectMatch = content.match(/export const SPECIALTY_KNOWLEDGE.* = (\{[\s\S]*\});/);

if (!objectMatch) {
  console.error("Could not parse SPECIALTY_KNOWLEDGE");
  process.exit(1);
}

let specialtyKnowledge;
try {
  // Use eval to evaluate the JS object string
  specialtyKnowledge = eval('(' + objectMatch[1] + ')');
} catch (e) {
  console.error("Eval failed", e);
  process.exit(1);
}

// Supabase setup
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_KEY in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Starting seed process...");

  for (const [key, specialty] of Object.entries(specialtyKnowledge)) {
    console.log(`Processing specialty: ${specialty.name}`);
    
    // Insert Specialty
    const { data: specData, error: specError } = await supabase
      .from('specialties')
      .upsert({
        id: specialty.id,
        name: specialty.name,
        scientific_name: specialty.scientificName,
        icon: specialty.icon,
        color: specialty.color,
        general_scope: specialty.generalScope,
      }, { onConflict: 'id' })
      .select();

    if (specError) {
      console.error(`Error inserting specialty ${specialty.id}:`, specError);
      continue;
    }

    // Insert Categories
    for (const category of specialty.categories || []) {
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .upsert({
          id: category.id,
          specialty_id: specialty.id,
          title: category.title,
          description: category.description,
          icon: category.icon
        }, { onConflict: 'id, specialty_id' });
        
      if (catError) {
        console.error(`Error inserting category ${category.id}:`, catError);
        continue;
      }

      // Insert Topics
      for (const topic of category.topics || []) {
        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .upsert({
            id: topic.id,
            specialty_id: specialty.id,
            category_id: category.id,
            title: topic.title,
            subtitle: topic.subtitle,
            type: topic.type,
            ai_scope_description: topic.aiScopeDescription,
            clinical_content: topic.clinicalContent || []
          }, { onConflict: 'id, specialty_id, category_id' });
          
        if (topicError) {
          console.error(`Error inserting topic ${topic.id}:`, topicError);
        }
      }
    }
  }
  console.log("Seeding complete!");
}

seed();
