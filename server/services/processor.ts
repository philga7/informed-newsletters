import { gmailService } from './gmail.js';
import { linkExtractor } from './link-extractor.js';
import { aiSummarizer } from './ai-summarizer.js';
import { supabase } from '../config/supabase.js';
import { logOperation } from './logger.js';

export class NewsletterProcessor {
  async processNewNewsletters() {
    try {
      await logOperation('info', 'process_start', 'Starting newsletter processing job');

      await gmailService.initialize();

      const emails = await gmailService.fetchUnprocessedEmails();

      if (emails.length === 0) {
        await logOperation('info', 'process_complete', 'No new newsletters to process');
        return;
      }

      const savedNewsletters = await gmailService.saveNewsletters(emails);

      for (const newsletter of savedNewsletters) {
        await this.processSingleNewsletter(newsletter);
      }

      await this.createAggregatedSummary();

      await logOperation('info', 'process_complete', `Successfully processed ${savedNewsletters.length} newsletters`);
    } catch (error: any) {
      await logOperation('error', 'process_error', 'Newsletter processing job failed', {
        error: error.message,
      });
      throw error;
    }
  }

  private async processSingleNewsletter(newsletter: any) {
    try {
      await supabase
        .from('newsletters')
        .update({ processed_status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', newsletter.id);

      const extractedLinks = await linkExtractor.extractLinks(
        newsletter.id,
        newsletter.html_content
      );

      const resolvedLinks = await linkExtractor.resolveLinks(extractedLinks);

      await linkExtractor.saveLinks(resolvedLinks);

      await aiSummarizer.summarizeNewsletter(
        newsletter.id,
        newsletter.html_content,
        resolvedLinks
      );

      await logOperation('info', 'process_newsletter', 'Successfully processed newsletter', {
        newsletterId: newsletter.id,
        subject: newsletter.subject,
      });
    } catch (error: any) {
      await logOperation('error', 'process_newsletter', 'Failed to process newsletter', {
        newsletterId: newsletter.id,
        error: error.message,
      });
      throw error;
    }
  }

  private async createAggregatedSummary() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const { data: recentSummaries } = await supabase
        .from('summaries')
        .select('id, newsletter_id, created_at')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false });

      if (!recentSummaries || recentSummaries.length < 2) {
        await logOperation('info', 'aggregate_skip', 'Not enough summaries for aggregation');
        return;
      }

      const existingAggregation = await supabase
        .from('newsletter_aggregations')
        .select('aggregated_summary_id')
        .in('newsletter_id', recentSummaries.map(s => s.newsletter_id))
        .maybeSingle();

      if (existingAggregation) {
        await logOperation('info', 'aggregate_skip', 'Aggregation already exists for these newsletters');
        return;
      }

      const summaryIds = recentSummaries.map(s => s.id);
      const dateRangeStart = new Date(recentSummaries[recentSummaries.length - 1].created_at);
      const dateRangeEnd = new Date(recentSummaries[0].created_at);

      await aiSummarizer.aggregateSummaries(summaryIds, dateRangeStart, dateRangeEnd);

      await logOperation('info', 'aggregate_complete', 'Successfully created aggregated summary', {
        summaryCount: recentSummaries.length,
      });
    } catch (error: any) {
      await logOperation('error', 'aggregate_error', 'Failed to create aggregated summary', {
        error: error.message,
      });
    }
  }

  async manualTrigger() {
    await logOperation('info', 'manual_trigger', 'Manual processing triggered');
    return this.processNewNewsletters();
  }
}

export const newsletterProcessor = new NewsletterProcessor();
