import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('summaries')
      .select(`
        *,
        newsletter:newsletters(id, subject, sender, received_at)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('summaries')
      .select(`
        *,
        newsletter:newsletters(*),
        links:links(*)
      `)
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Summary not found' });

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/export', async (req, res) => {
  try {
    const { exported } = req.body;

    const { data, error } = await supabase
      .from('summaries')
      .update({ exported_to_kb: exported })
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Summary not found' });

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/aggregated/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('aggregated_summaries')
      .select(`
        *,
        aggregations:newsletter_aggregations(
          newsletter:newsletters(id, subject, sender, received_at)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/aggregated/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('aggregated_summaries')
      .select(`
        *,
        aggregations:newsletter_aggregations(
          newsletter:newsletters(*)
        )
      `)
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Aggregated summary not found' });

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
