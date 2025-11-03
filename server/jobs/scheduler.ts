import cron, { ScheduledTask } from 'node-cron';
import { newsletterProcessor } from '../services/processor.js';
import { supabase } from '../config/supabase.js';
import { logOperation } from '../services/logger.js';

let scheduledJobs: ScheduledTask[] = [];

export async function setupCronJobs() {
  try {
    const { data } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'cron_schedule')
      .maybeSingle();

    const schedule = data?.value || { times: ['06:00', '18:00'], timezone: 'America/New_York' };

    for (const time of schedule.times) {
      const [hour, minute] = time.split(':');
      const cronExpression = `${minute} ${hour} * * *`;

      const job = cron.schedule(
        cronExpression,
        async () => {
          await logOperation('info', 'cron_trigger', `Scheduled job triggered at ${time}`);
          try {
            await newsletterProcessor.processNewNewsletters();
          } catch (error: any) {
            await logOperation('error', 'cron_error', 'Scheduled job failed', {
              error: error.message,
            });
          }
        }
      );

      scheduledJobs.push(job);
      await logOperation('info', 'cron_setup', `Scheduled job for ${time} ${schedule.timezone}`);
    }

    console.log(`Cron jobs configured: ${schedule.times.join(', ')} (${schedule.timezone})`);
  } catch (error: any) {
    await logOperation('error', 'cron_setup', 'Failed to setup cron jobs', {
      error: error.message,
    });
    console.error('Failed to setup cron jobs:', error);
  }
}

export function stopAllJobs() {
  scheduledJobs.forEach(job => job.stop());
  scheduledJobs = [];
}

export async function updateSchedule() {
  stopAllJobs();
  await setupCronJobs();
}
