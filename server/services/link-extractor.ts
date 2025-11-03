import * as cheerio from 'cheerio';
import { supabase } from '../config/supabase.js';
import { logOperation } from './logger.js';

const BEEHIIV_PATTERN = /link\.mail\.beehiiv\.com/i;

export class LinkExtractor {
  async extractLinks(newsletterId: string, htmlContent: string) {
    try {
      const $ = cheerio.load(htmlContent);
      const links: Array<{
        newsletterId: string;
        beehiivUrl: string;
        associatedText: string;
      }> = [];

      $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (!href || !BEEHIIV_PATTERN.test(href)) return;

        let associatedText = $(element).text().trim();

        if (!associatedText || associatedText.length < 10) {
          const parent = $(element).parent();
          associatedText = parent.text().trim();
        }

        if (!associatedText || associatedText.length < 10) {
          let current = $(element).parent();
          for (let i = 0; i < 3 && current.length; i++) {
            const text = current.text().trim();
            if (text.length > associatedText.length) {
              associatedText = text;
            }
            current = current.parent();
          }
        }

        const sentences = associatedText.split(/[.!?]+/);
        const linkText = $(element).text().trim();
        const relevantSentence = sentences.find(s => s.includes(linkText)) || sentences[0] || associatedText;

        links.push({
          newsletterId,
          beehiivUrl: href,
          associatedText: relevantSentence.trim() || associatedText.substring(0, 500),
        });
      });

      await logOperation('info', 'link_extract', `Extracted ${links.length} beehiiv links`, { newsletterId });
      return links;
    } catch (error: any) {
      await logOperation('error', 'link_extract', 'Failed to extract links', {
        newsletterId,
        error: error.message
      });
      throw error;
    }
  }

  async resolveLinks(links: any[]) {
    const config = await this.getConfig();
    const timeout = config.link_resolution_timeout_ms || 10000;

    const resolved = [];
    for (const link of links) {
      const finalUrl = await this.resolveSingleLink(link.beehiivUrl, timeout);
      resolved.push({
        newsletter_id: link.newsletterId,
        beehiiv_url: link.beehiivUrl,
        final_url: finalUrl.url,
        associated_text: link.associatedText,
        resolution_status: finalUrl.status,
      });
    }

    return resolved;
  }

  private async resolveSingleLink(url: string, timeout: number) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return {
        url: response.url,
        status: 'resolved',
      };
    } catch (error: any) {
      await logOperation('warning', 'link_resolve', `Failed to resolve link: ${url}`, {
        error: error.message
      });
      return {
        url: null,
        status: 'failed',
      };
    }
  }

  async saveLinks(links: any[]) {
    try {
      const { data, error } = await supabase
        .from('links')
        .insert(links)
        .select();

      if (error) throw error;

      await logOperation('info', 'link_save', `Saved ${links.length} links to database`);
      return data;
    } catch (error: any) {
      await logOperation('error', 'link_save', 'Failed to save links', { error: error.message });
      throw error;
    }
  }

  private async getConfig() {
    const { data } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'link_resolution_timeout_ms')
      .maybeSingle();

    return data?.value || {};
  }
}

export const linkExtractor = new LinkExtractor();
