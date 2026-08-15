const express = require('express');
const router = express.Router();
const { synthesizeTopicOnDemand } = require('../services/referenceTopicMiner');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * GET /api/topics/search?specialtyId=skin&q=psoriasis
 * Searches compiled topics in Supabase
 */
router.get('/search', async (req, res) => {
  try {
    const { specialtyId, q, categoryId } = req.query;
    let query = supabase.from('topics').select('*');

    if (specialtyId) {
      query = query.eq('specialty_id', specialtyId);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (q) {
      query = query.or(`title.ilike.%${q}%,subtitle.ilike.%${q}%`);
    }

    const { data, error } = await query.limit(50);
    if (error) throw error;
    res.json({ topics: data || [] });
  } catch (err) {
    console.error('[TopicRoutes] Search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/topics/synthesize-from-reference
 * Synthesizes a topic on-demand strictly grounded in references
 */
router.post('/synthesize-from-reference', async (req, res) => {
  try {
    const { specialtyId, categoryId, query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Clinical query is required.' });
    }

    const compiled = await synthesizeTopicOnDemand(specialtyId || 'heart', categoryId || 'clinical_topics', query);
    if (!compiled || compiled.error) {
      return res.status(404).json({ error: compiled?.error || 'Failed to synthesize topic from reference.' });
    }

    res.json({ topic: compiled });
  } catch (err) {
    console.error('[TopicRoutes] Synthesis error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
