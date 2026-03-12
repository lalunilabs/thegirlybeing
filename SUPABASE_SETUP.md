# Girly Being - Supabase Setup Guide

## What You're Setting Up

1. **Database** - Store newsletter subscribers
2. **Email Service** - Send welcome emails & bi-weekly newsletters
3. **API** - Connect your website to the backend

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up/login with GitHub
3. Click "New Project"
4. Name: `girly-being`
5. Region: Choose closest to your audience (e.g., US East)
6. Plan: Free tier is fine to start
7. Click "Create Project"

## Step 2: Get Your API Keys

Once project is created:

1. Go to Project Settings (gear icon) → API
2. Copy these values:
   - **Project URL** (e.g., `https://abcdef123456.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role secret** key (keep this private!)

## Step 3: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy/paste the entire contents of `supabase-schema.sql`
4. Click "Run"

This creates:
- `subscribers` table (stores emails)
- `newsletter_issues` table (tracks sent newsletters)
- `email_logs` table (tracks opens/clicks)

## Step 4: Set Up Email Service (Resend)

1. Go to https://resend.com
2. Sign up with your email
3. Add a domain (e.g., `girlybeing.com`) or use Resend's test domain
4. Get your API key from https://resend.com/api-keys
5. Copy the API key

## Step 5: Deploy Edge Function

1. In Supabase dashboard, go to **Edge Functions**
2. Click "New Function"
3. Name: `send-newsletter`
4. Copy/paste contents of `supabase-edge-function.ts`
5. Click "Deploy"

## Step 6: Set Environment Variables

1. Go to Project Settings → Edge Functions
2. Add these secrets:
   ```
   RESEND_API_KEY = your-resend-api-key
   ```

## Step 7: Update Your Website

1. Open `index.html` and `all-articles.html`
2. Add this line in the `<head>` section:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```
3. Add this line at the bottom of `<body>`:
   ```html
   <script src="supabase-newsletter.js"></script>
   ```
4. Edit `supabase-newsletter.js` and replace:
   - `SUPABASE_URL` with your actual project URL
   - `SUPABASE_ANON_KEY` with your actual anon key

## Step 8: Test It

1. Open your website locally or deploy it
2. Enter an email in the newsletter signup
3. Check:
   - Supabase Table Editor → subscribers (should see the email)
   - Your email inbox (should get welcome email)

## Step 9: Deploy to Live

Push the updated files to GitHub:
```bash
git add .
git commit -m "Add Supabase newsletter integration"
git push origin main
```

## Sending Newsletters

To send bi-weekly newsletters:

1. Go to Supabase Dashboard → SQL Editor
2. Run this query to send to all active subscribers:
   ```sql
   -- This calls the Edge Function for each subscriber
   -- (You'll need to create a script or use a tool for this)
   ```

Or use the Supabase CLI:
```bash
# Install supabase CLI first
supabase functions invoke send-newsletter --data '{"email":"test@example.com","type":"newsletter"}'
```

## Troubleshooting

**Emails not sending?**
- Check Resend dashboard for delivery status
- Verify RESEND_API_KEY is set correctly
- Check Edge Function logs in Supabase

**Subscribers not saving?**
- Check browser console for errors
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Check RLS policies in Database → Tables → subscribers → Policies

**CORS errors?**
- Add your domain to Supabase CORS settings (API → Settings)

## Cost

- **Supabase Free Tier**: 500MB database, 2GB bandwidth
- **Resend Free Tier**: 3,000 emails/month
- Total: **$0** until you grow beyond these limits

## Next Steps

1. Set up custom domain (girlybeing.com)
2. Configure email templates in Resend
3. Add email analytics tracking
4. Set up automated welcome sequence

---

Need help? Check:
- Supabase docs: https://supabase.com/docs
- Resend docs: https://resend.com/docs
