require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testAutoGeneration() {
  console.log("Adding a new topic with a blank AI scope...");
  const newTopic = {
    id: 'test-topic-hypertension',
    specialty_id: 'heart',
    category_id: 'clinical_topics',
    title: 'Hypertensive Crisis',
    subtitle: 'Management of severe hypertension',
    type: 'Clinical Protocol',
    ai_scope_description: '' // BLANK!
  };

  const { error } = await supabase.from('topics').insert(newTopic);
  if (error) {
    console.error("Error inserting:", error.message);
  } else {
    console.log("Success! Topic inserted.");
  }
}

testAutoGeneration();
