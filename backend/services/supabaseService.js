const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: SUPABASE_URL or SUPABASE_KEY is missing in backend/.env');
}

const supabase = createClient(supabaseUrl || 'https://example.supabase.co', supabaseKey || 'anon_key');

/**
 * Fetch the base scope for a specialty.
 */
async function getSpecialtyScope(specialtyId) {
  const { data, error } = await supabase
    .from('specialties')
    .select('general_scope')
    .eq('id', specialtyId)
    .single();

  if (error || !data) {
    console.error(`[Supabase] Error fetching specialty scope for ${specialtyId}:`, error?.message);
    return null;
  }
  return data.general_scope;
}

/**
 * Fetch the AI description for a specific topic.
 */
async function getTopicAiScope(topicId) {
  const { data, error } = await supabase
    .from('topics')
    .select('ai_scope_description')
    .eq('id', topicId)
    .single();

  if (error || !data) {
    console.error(`[Supabase] Error fetching topic AI scope for ${topicId}:`, error?.message);
    return null;
  }
  return data.ai_scope_description;
}

/**
 * Optional: if we want category-level scope
 */
async function getCategoryScope(specialtyId, categoryId) {
  const { data, error } = await supabase
    .from('categories')
    .select('description')
    .eq('specialty_id', specialtyId)
    .eq('id', categoryId)
    .single();

  if (error || !data) {
    console.error(`[Supabase] Error fetching category scope for ${categoryId}:`, error?.message);
    return null;
  }
  return data.description;
}

module.exports = {
  getSpecialtyScope,
  getTopicAiScope,
  getCategoryScope,
};
