/*
  # Create Newsletter Processing Schema

  ## Overview
  This migration creates the complete database schema for the AI Newsletter Aggregator system.
  
  ## New Tables
  
  ### 1. newsletters
  Stores raw email data from Gmail
  - `id` (uuid, primary key) - Unique identifier
  - `gmail_message_id` (text, unique) - Gmail message ID for deduplication
  - `subject` (text) - Email subject line
  - `sender` (text) - Email sender address
  - `received_at` (timestamptz) - When email was received
  - `html_content` (text) - Raw HTML content of email
  - `processed_status` (text) - Status: pending, processing, completed, failed
  - `created_at` (timestamptz) - When record was created
  - `updated_at` (timestamptz) - When record was last updated
  
  ### 2. summaries
  Stores individual newsletter summaries
  - `id` (uuid, primary key) - Unique identifier
  - `newsletter_id` (uuid, foreign key) - Reference to newsletters table
  - `markdown_content` (text) - Processed markdown summary
  - `processing_time_ms` (integer) - Time taken to process
  - `exported_to_kb` (boolean) - Whether exported to Knowledge Base
  - `created_at` (timestamptz) - When summary was created
  
  ### 3. aggregated_summaries
  Stores merged summaries across multiple newsletters
  - `id` (uuid, primary key) - Unique identifier
  - `date_range_start` (timestamptz) - Start of aggregation period
  - `date_range_end` (timestamptz) - End of aggregation period
  - `markdown_content` (text) - Aggregated markdown summary
  - `newsletter_count` (integer) - Number of newsletters included
  - `created_at` (timestamptz) - When aggregated summary was created
  
  ### 4. newsletter_aggregations
  Junction table linking newsletters to aggregated summaries
  - `aggregated_summary_id` (uuid, foreign key) - Reference to aggregated_summaries
  - `newsletter_id` (uuid, foreign key) - Reference to newsletters
  - Composite primary key on both fields
  
  ### 5. links
  Stores extracted and resolved links
  - `id` (uuid, primary key) - Unique identifier
  - `newsletter_id` (uuid, foreign key) - Reference to newsletters table
  - `beehiiv_url` (text) - Original beehiiv redirect URL
  - `final_url` (text) - Resolved destination URL
  - `associated_text` (text) - Verbatim text context around link
  - `resolution_status` (text) - Status: pending, resolved, failed
  - `created_at` (timestamptz) - When link was extracted
  
  ### 6. processing_logs
  Tracks system operations and errors
  - `id` (uuid, primary key) - Unique identifier
  - `log_type` (text) - Type: info, warning, error
  - `operation` (text) - Operation being performed
  - `message` (text) - Log message
  - `details` (jsonb) - Additional structured data
  - `created_at` (timestamptz) - When log was created
  
  ### 7. system_config
  Stores system configuration
  - `key` (text, primary key) - Configuration key
  - `value` (jsonb) - Configuration value
  - `updated_at` (timestamptz) - When config was last updated
  
  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated access (for future auth if needed)
  - Currently permissive for service role access
  
  ## Indexes
  - Add indexes on frequently queried columns for performance
*/

-- Create newsletters table
CREATE TABLE IF NOT EXISTS newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gmail_message_id text UNIQUE NOT NULL,
  subject text NOT NULL,
  sender text NOT NULL,
  received_at timestamptz NOT NULL,
  html_content text NOT NULL,
  processed_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create summaries table
CREATE TABLE IF NOT EXISTS summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id uuid NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  markdown_content text NOT NULL,
  processing_time_ms integer,
  exported_to_kb boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create aggregated_summaries table
CREATE TABLE IF NOT EXISTS aggregated_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_range_start timestamptz NOT NULL,
  date_range_end timestamptz NOT NULL,
  markdown_content text NOT NULL,
  newsletter_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create junction table for newsletter aggregations
CREATE TABLE IF NOT EXISTS newsletter_aggregations (
  aggregated_summary_id uuid NOT NULL REFERENCES aggregated_summaries(id) ON DELETE CASCADE,
  newsletter_id uuid NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  PRIMARY KEY (aggregated_summary_id, newsletter_id)
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id uuid NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  beehiiv_url text NOT NULL,
  final_url text,
  associated_text text NOT NULL,
  resolution_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create processing_logs table
CREATE TABLE IF NOT EXISTS processing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type text NOT NULL,
  operation text NOT NULL,
  message text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create system_config table
CREATE TABLE IF NOT EXISTS system_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(processed_status);
CREATE INDEX IF NOT EXISTS idx_newsletters_received ON newsletters(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_summaries_newsletter ON summaries(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_summaries_exported ON summaries(exported_to_kb);
CREATE INDEX IF NOT EXISTS idx_links_newsletter ON links(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_links_resolution ON links(resolution_status);
CREATE INDEX IF NOT EXISTS idx_logs_created ON processing_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_type ON processing_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_aggregated_date ON aggregated_summaries(date_range_start, date_range_end);

-- Enable Row Level Security
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggregated_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for service role (for now, will add auth later if needed)
CREATE POLICY "Allow all access to newsletters"
  ON newsletters FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to summaries"
  ON summaries FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to aggregated_summaries"
  ON aggregated_summaries FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to newsletter_aggregations"
  ON newsletter_aggregations FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to links"
  ON links FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to processing_logs"
  ON processing_logs FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to system_config"
  ON system_config FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default configuration
INSERT INTO system_config (key, value) VALUES
  ('cron_schedule', '{"times": ["06:00", "18:00"], "timezone": "America/New_York"}'::jsonb),
  ('ollama_rate_limit_ms', '1000'::jsonb),
  ('link_resolution_timeout_ms', '10000'::jsonb)
ON CONFLICT (key) DO NOTHING;
