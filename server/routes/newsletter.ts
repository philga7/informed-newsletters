import express from 'express';
import { supabase } from '../config/supabase.js';
import { newsletterProcessor } from '../services/processor.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .order('received_at', { ascending: false });

    if (error) throw error;

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Newsletter not found' });

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/process', async (req, res) => {
  try {
    await newsletterProcessor.manualTrigger();
    res.json({ message: 'Processing started successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/reprocess', async (req, res) => {
  try {
    const { data: newsletter, error: fetchError } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' });

    await supabase
      .from('newsletters')
      .update({ processed_status: 'pending' })
      .eq('id', req.params.id);

    await newsletterProcessor.manualTrigger();

    res.json({ message: 'Reprocessing started successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
