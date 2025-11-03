import express from 'express';
import { supabase } from '../config/supabase.js';
import { updateSchedule } from '../jobs/scheduler.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('*');

    if (error) throw error;

    const config = data.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    res.json({ data: config });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const { data, error } = await supabase
      .from('system_config')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (key === 'cron_schedule') {
      await updateSchedule();
    }

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
