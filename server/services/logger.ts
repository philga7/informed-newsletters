import { supabase } from '../config/supabase.js';

export async function logOperation(
  logType: 'info' | 'warning' | 'error',
  operation: string,
  message: string,
  details: Record<string, any> = {}
) {
  try {
    await supabase.from('processing_logs').insert({
      log_type: logType,
      operation,
      message,
      details,
    });

    console.log(`[${logType.toUpperCase()}] ${operation}: ${message}`, details);
  } catch (error) {
    console.error('Failed to log operation:', error);
  }
}
