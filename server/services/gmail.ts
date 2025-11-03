import { google } from 'googleapis';
import { supabase } from '../config/supabase.js';
import { logOperation } from './logger.js';

const LABEL_NAME = 'n8n-newsletter';

export class GmailService {
  private gmail: any;
  private auth: any;

  async initialize() {
    try {
      const credentials = JSON.parse(process.env.GMAIL_CREDENTIALS || '{}');
      const token = JSON.parse(process.env.GMAIL_TOKEN || '{}');

      this.auth = new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uris?.[0]
      );

      this.auth.setCredentials(token);

      this.gmail = google.gmail({ version: 'v1', auth: this.auth });

      await logOperation('info', 'gmail_init', 'Gmail API initialized successfully');
    } catch (error: any) {
      await logOperation('error', 'gmail_init', 'Failed to initialize Gmail API', { error: error.message });
      throw error;
    }
  }

  async fetchUnprocessedEmails() {
    try {
      const labels = await this.gmail.users.labels.list({ userId: 'me' });
      const label = labels.data.labels?.find((l: any) => l.name === LABEL_NAME);

      if (!label) {
        await logOperation('warning', 'gmail_fetch', `Label "${LABEL_NAME}" not found`);
        return [];
      }

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        labelIds: [label.id],
        maxResults: 50,
      });

      if (!response.data.messages) {
        await logOperation('info', 'gmail_fetch', 'No messages found');
        return [];
      }

      const { data: existingNewsletters } = await supabase
        .from('newsletters')
        .select('gmail_message_id');

      const existingIds = new Set(
        existingNewsletters?.map((n: any) => n.gmail_message_id) || []
      );

      const unprocessedMessages = response.data.messages.filter(
        (msg: any) => !existingIds.has(msg.id)
      );

      await logOperation('info', 'gmail_fetch', `Found ${unprocessedMessages.length} unprocessed messages`);

      const emails = [];
      for (const message of unprocessedMessages) {
        const email = await this.fetchEmailDetails(message.id);
        if (email) {
          emails.push(email);
        }
      }

      return emails;
    } catch (error: any) {
      await logOperation('error', 'gmail_fetch', 'Failed to fetch emails', { error: error.message });
      throw error;
    }
  }

  private async fetchEmailDetails(messageId: string) {
    try {
      const message = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const headers = message.data.payload?.headers || [];
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
      const from = headers.find((h: any) => h.name === 'From')?.value || '';
      const date = headers.find((h: any) => h.name === 'Date')?.value || '';

      const htmlContent = this.extractHtmlContent(message.data.payload);

      if (!htmlContent) {
        await logOperation('warning', 'gmail_fetch', `No HTML content found for message ${messageId}`);
        return null;
      }

      return {
        gmailMessageId: messageId,
        subject,
        sender: from,
        receivedAt: new Date(date).toISOString(),
        htmlContent,
      };
    } catch (error: any) {
      await logOperation('error', 'gmail_fetch', `Failed to fetch message ${messageId}`, { error: error.message });
      return null;
    }
  }

  private extractHtmlContent(payload: any): string | null {
    if (payload.mimeType === 'text/html' && payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
        if (part.parts) {
          const html = this.extractHtmlContent(part);
          if (html) return html;
        }
      }
    }

    return null;
  }

  async saveNewsletters(emails: any[]) {
    try {
      const newsletters = emails.map((email) => ({
        gmail_message_id: email.gmailMessageId,
        subject: email.subject,
        sender: email.sender,
        received_at: email.receivedAt,
        html_content: email.htmlContent,
        processed_status: 'pending',
      }));

      const { data, error } = await supabase
        .from('newsletters')
        .insert(newsletters)
        .select();

      if (error) throw error;

      await logOperation('info', 'gmail_save', `Saved ${newsletters.length} newsletters to database`);
      return data;
    } catch (error: any) {
      await logOperation('error', 'gmail_save', 'Failed to save newsletters', { error: error.message });
      throw error;
    }
  }
}

export const gmailService = new GmailService();
