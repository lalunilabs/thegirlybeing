-- Girly Being Newsletter Database Schema
-- Run this in your Supabase SQL Editor

-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  source TEXT DEFAULT 'website', -- where they signed up from
  confirmed BOOLEAN DEFAULT FALSE, -- double opt-in
  confirmation_token TEXT UNIQUE,
  preferences JSONB DEFAULT '{"frequency": "bi-weekly", "topics": []}'::jsonb
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);

-- Create newsletter_issues table (for tracking sent newsletters)
CREATE TABLE IF NOT EXISTS newsletter_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
  subscriber_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0
);

-- Create email_logs table (for tracking individual sends)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID REFERENCES subscribers(id),
  newsletter_id UUID REFERENCES newsletter_issues(id),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'bounced', 'opened', 'clicked'))
);

-- Row Level Security (RLS) policies
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert subscribers (for signup form)
CREATE POLICY "Allow anon to insert subscribers" ON subscribers
  FOR INSERT TO anon WITH CHECK (true);

-- Allow anon to update their own record with confirmation token
CREATE POLICY "Allow anon to confirm subscription" ON subscribers
  FOR UPDATE TO anon USING (confirmation_token IS NOT NULL);

-- Only service role can read all subscribers
CREATE POLICY "Service role can read all subscribers" ON subscribers
  FOR SELECT TO service_role USING (true);

-- Create function to handle new subscriber
CREATE OR REPLACE FUNCTION handle_new_subscriber()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate confirmation token
  NEW.confirmation_token := encode(gen_random_bytes(32), 'hex');
  NEW.subscribed_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new subscribers
DROP TRIGGER IF EXISTS on_subscriber_created ON subscribers;
CREATE TRIGGER on_subscriber_created
  BEFORE INSERT ON subscribers
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_subscriber();

-- Insert test data (optional, remove in production)
-- INSERT INTO subscribers (email, name, status, confirmed) 
-- VALUES ('test@example.com', 'Test User', 'active', true);
