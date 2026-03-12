// Supabase Edge Function for Girly Being Newsletter
// File: supabase/functions/send-newsletter/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, type = 'welcome' } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Check if subscriber exists
    const { data: subscriber, error: subError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      throw subError
    }

    let subject = ''
    let html = ''

    // Welcome email template
    if (type === 'welcome') {
      subject = "✿ Welcome to It's a Girl Thing - Your Bi-Weekly Newsletter"
      html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to It's a Girl Thing</title>
  <style>
    body { font-family: 'DM Sans', -apple-system, sans-serif; background: #FFF5F8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFCF8; }
    .header { background: linear-gradient(135deg, #E8849A, #C96480); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; font-family: 'Playfair Display', serif; margin: 0; font-size: 28px; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
    .content { padding: 40px 30px; color: #2E1422; }
    .content h2 { font-family: 'Playfair Display', serif; color: #5A2E4A; margin-top: 0; }
    .content p { line-height: 1.7; font-size: 16px; }
    .quote { background: #FAE4EC; padding: 20px; border-left: 4px solid #C96480; margin: 30px 0; font-style: italic; }
    .cta { display: inline-block; background: linear-gradient(135deg, #E8849A, #C96480); color: white; text-decoration: none; padding: 15px 30px; border-radius: 30px; margin: 20px 0; font-weight: 600; }
    .footer { background: #FAE4EC; padding: 30px; text-align: center; color: #9A7882; font-size: 14px; }
    .footer a { color: #C96480; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✿ Welcome, Beautiful</h1>
      <p>You just joined 25,000+ women who get it.</p>
    </div>
    <div class="content">
      <h2>You're officially part of It's a Girl Thing</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Every two weeks, you'll get one article that makes you feel like a woman who truly knows herself. No spam, no noise, just the good stuff.</p>
      
      <div class="quote">
        "The most revolutionary thing a woman can do is know her own mind."
      </div>
      
      <p>What to expect:</p>
      <ul>
        <li>✦ One article every 2 weeks (Sunday mornings)</li>
        <li>✦ Deep dives into womanhood, psychology, and cycles</li>
        <li>✦ Written with warmth, never preachy</li>
        <li>✦ Unsubscribe anytime (no hard feelings)</li>
      </ul>
      
      <center><a href="https://girlybeing.com" class="cta">Visit Girly Being</a></center>
    </div>
    <div class="footer">
      <p>It's a Girl Thing by Girly Being</p>
      <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="https://girlybeing.com">Visit Website</a></p>
    </div>
  </div>
</body>
</html>`
    }

    // Bi-weekly newsletter template
    if (type === 'newsletter') {
      subject = "✿ This Week: The Art of Seeing Without Drowning"
      html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>It's a Girl Thing - Bi-Weekly Edition</title>
  <style>
    body { font-family: 'DM Sans', -apple-system, sans-serif; background: #FFF5F8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFCF8; }
    .header { background: linear-gradient(135deg, #E8849A, #C96480); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; font-family: 'Playfair Display', serif; margin: 0; font-size: 32px; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; font-style: italic; }
    .content { padding: 40px 30px; color: #2E1422; }
    .article-card { background: #FAE4EC; padding: 30px; border-radius: 12px; margin: 30px 0; }
    .article-card h2 { font-family: 'Playfair Display', serif; color: #5A2E4A; margin-top: 0; }
    .article-card p { line-height: 1.7; font-size: 16px; }
    .cta { display: inline-block; background: linear-gradient(135deg, #E8849A, #C96480); color: white; text-decoration: none; padding: 15px 30px; border-radius: 30px; margin: 20px 0; font-weight: 600; }
    .footer { background: #FAE4EC; padding: 30px; text-align: center; color: #9A7882; font-size: 14px; }
    .footer a { color: #C96480; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✿ It's a Girl Thing</h1>
      <p>Bi-weekly newsletter for women who know themselves</p>
    </div>
    <div class="content">
      <div class="article-card">
        <h2>The Art of Seeing Without Drowning</h2>
        <p>You can feel everything deeply AND see clearly. Learn the art of emotional detachment without abandoning your feelings...</p>
        <center><a href="https://girlybeing.com/post-the-art-of-seeing-without-drowning.html" class="cta">Read the Article</a></center>
      </div>
      
      <p style="text-align: center; color: #9A7882; margin-top: 40px;">
        ✦ Next issue in 2 weeks ✦
      </p>
    </div>
    <div class="footer">
      <p>You're receiving this because you subscribed to It's a Girl Thing</p>
      <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="https://girlybeing.com">Visit Website</a></p>
    </div>
  </div>
</body>
</html>`
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "It's a Girl Thing <newsletter@girlybeing.com>",
        to: [email],
        subject: subject,
        html: html,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    const data = await res.json()

    // Log email send
    if (subscriber) {
      await supabase.from('email_logs').insert({
        subscriber_id: subscriber.id,
        sent_at: new Date().toISOString(),
        status: 'sent',
      })
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully', id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
