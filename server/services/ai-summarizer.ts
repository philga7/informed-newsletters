import OpenAI from 'openai';
import { supabase } from '../config/supabase.js';
import { logOperation } from './logger.js';

export class AISummarizer {
  private client: OpenAI;
  private model: string;

  constructor() {
    const baseURL = process.env.OLLAMA_BASE_URL || 'https://api.ollama.cloud/v1';
    const apiKey = process.env.OLLAMA_API_KEY || '';
    this.model = process.env.OLLAMA_MODEL || 'deepseek-v3.1:671b';

    this.client = new OpenAI({
      baseURL,
      apiKey,
    });
  }

  async summarizeNewsletter(newsletterId: string, htmlContent: string, links: any[]) {
    const startTime = Date.now();

    try {
      const config = await this.getConfig();
      const rateLimit = config.ollama_rate_limit_ms || 1000;

      await this.waitForRateLimit(rateLimit);

      const prompt = this.buildSummaryPrompt(htmlContent, links);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at summarizing AI and technology newsletters. Create concise, informative summaries that preserve key information and context around links. Output in clean markdown format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      });

      const markdownContent = response.choices[0]?.message?.content || '';
      const processingTime = Date.now() - startTime;

      const { data, error } = await supabase
        .from('summaries')
        .insert({
          newsletter_id: newsletterId,
          markdown_content: markdownContent,
          processing_time_ms: processingTime,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('newsletters')
        .update({ processed_status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', newsletterId);

      await logOperation('info', 'ai_summarize', 'Successfully summarized newsletter', {
        newsletterId,
        processingTime,
      });

      return data;
    } catch (error: any) {
      await supabase
        .from('newsletters')
        .update({ processed_status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', newsletterId);

      await logOperation('error', 'ai_summarize', 'Failed to summarize newsletter', {
        newsletterId,
        error: error.message,
      });
      throw error;
    }
  }

  private buildSummaryPrompt(htmlContent: string, links: any[]): string {
    const linksContext = links.map((link, idx) =>
      `Link ${idx + 1}: [${link.associated_text}](${link.final_url || link.beehiiv_url})`
    ).join('\n');

    return `
Summarize this AI/tech newsletter into a concise, readable markdown format. Follow these rules:

1. For each main topic or news item, create a paragraph that:
   - Starts with the key subject/tool name as a link if available
   - Provides a clear, concise summary of what it is and why it matters
   - Preserves the exact phrasing when describing linked items

2. If a section discusses multiple tools or links, summarize the section content and list all associated links at the end.

3. Group related information together logically.

4. Output ONLY the markdown summary, no meta-commentary.

5. Preserve the verbatim text that was associated with each link in your summary.

HTML Content:
${htmlContent.substring(0, 15000)}

Extracted Links:
${linksContext}

Provide the summary now:
`;
  }

  async aggregateSummaries(summaryIds: string[], dateRangeStart: Date, dateRangeEnd: Date) {
    try {
      const { data: summaries } = await supabase
        .from('summaries')
        .select('newsletter_id, markdown_content')
        .in('id', summaryIds);

      if (!summaries || summaries.length === 0) {
        throw new Error('No summaries found for aggregation');
      }

      const config = await this.getConfig();
      const rateLimit = config.ollama_rate_limit_ms || 1000;

      await this.waitForRateLimit(rateLimit);

      const combinedContent = summaries.map((s, idx) =>
        `## Newsletter ${idx + 1}\n\n${s.markdown_content}`
      ).join('\n\n---\n\n');

      const prompt = `
You are aggregating multiple AI/tech newsletter summaries from the same time period. Your task:

1. Identify overlapping news stories or topics across different newsletters
2. Merge similar stories into single, comprehensive entries
3. Preserve unique perspectives and details from each source
4. Keep all links and maintain their associated context
5. Remove redundant information while keeping unique insights
6. Organize by topic/theme rather than by newsletter source
7. Output clean, organized markdown

Combined Summaries:
${combinedContent}

Provide the aggregated summary now:
`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at aggregating and deduplicating information from multiple sources while preserving important details and links.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      });

      const aggregatedContent = response.choices[0]?.message?.content || '';

      const { data: aggregatedSummary, error: aggError } = await supabase
        .from('aggregated_summaries')
        .insert({
          date_range_start: dateRangeStart.toISOString(),
          date_range_end: dateRangeEnd.toISOString(),
          markdown_content: aggregatedContent,
          newsletter_count: summaries.length,
        })
        .select()
        .single();

      if (aggError) throw aggError;

      const aggregations = summaries.map(s => ({
        aggregated_summary_id: aggregatedSummary.id,
        newsletter_id: s.newsletter_id,
      }));

      await supabase.from('newsletter_aggregations').insert(aggregations);

      await logOperation('info', 'ai_aggregate', 'Successfully created aggregated summary', {
        aggregatedSummaryId: aggregatedSummary.id,
        newsletterCount: summaries.length,
      });

      return aggregatedSummary;
    } catch (error: any) {
      await logOperation('error', 'ai_aggregate', 'Failed to create aggregated summary', {
        error: error.message,
      });
      throw error;
    }
  }

  private async waitForRateLimit(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getConfig() {
    const { data } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'ollama_rate_limit_ms')
      .maybeSingle();

    return data?.value || {};
  }
}

export const aiSummarizer = new AISummarizer();
