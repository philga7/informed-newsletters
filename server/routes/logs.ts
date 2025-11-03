import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logType = req.query.type as string;

    let query = supabase
      .from('processing_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (logType) {
      query = query.eq('log_type', logType);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const { data: errorCount } = await supabase
      .from('processing_logs')
      .select('id', { count: 'exact', head: true })
      .eq('log_type', 'error');

    const { data: lastRun } = await supabase
      .from('processing_logs')
      .select('created_at')
      .eq('operation', 'process_complete')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: totalNewsletters } = await supabase
      .from('newsletters')
      .select('id', { count: 'exact', head: true });

    const { data: processedNewsletters } = await supabase
      .from('newsletters')
      .select('id', { count: 'exact', head: true })
      .eq('processed_status', 'completed');

    res.json({
      data: {
        errorCount: errorCount?.length || 0,
        lastRunAt: lastRun?.created_at || null,
        totalNewsletters: totalNewsletters?.length || 0,
        processedNewsletters: processedNewsletters?.length || 0,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
