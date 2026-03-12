# Beehiiv Integration Guide

Your newsletter is already set up at: https://itsagirlthing.beehiiv.com/

## Option 1: Simple Link Integration (Easiest)

Just link your newsletter signup page directly. Update these links in your HTML:

```html
<!-- Instead of a form, use a button that links to Beehiiv -->
<a href="https://itsagirlthing.beehiiv.com/subscribe" class="cta-big" target="_blank">
  Subscribe Free ✿
</a>
```

## Option 2: Beehiiv Embed Form (Better UX)

Beehiiv provides embed codes. To get yours:

1. Log into Beehiiv dashboard: https://app.beehiiv.com
2. Go to **Settings** → **Subscribe Form**
3. Choose **Embed** option
4. Copy the HTML code
5. Replace the newsletter forms in your website with this embed code

### Where to add it:

**In `index.html` - Hero section (around line 371):**
```html
<!-- Replace this -->
<div class="nl-form-wrap">
  <input class="nl-input" type="email" placeholder="your@email.com">
  <button class="nl-btn">Subscribe — it's free ✿</button>
</div>

<!-- With Beehiiv embed -->
<div class="nl-form-wrap">
  <!-- Paste Beehiiv embed code here -->
  <iframe src="https://embeds.beehiiv.com/..." ...></iframe>
</div>
```

**In `all-articles.html` - Inline newsletter (around line 593):**
```html
<!-- Replace this -->
<div class="inl-right">
  <input class="inl-input" type="email" placeholder="your@email.com">
  <button class="inl-btn">Subscribe — it's free ✿</button>
</div>

<!-- With Beehiiv embed -->
<div class="inl-right">
  <!-- Paste Beehiiv embed code here -->
</div>
```

## Option 3: Custom Form → Beehiiv Redirect

I created `beehiiv-integration.js` which:
- Keeps your custom styled form
- Redirects to Beehiiv subscribe page with email pre-filled
- Maintains the Girly Being aesthetic

To use it:
1. Open `index.html` and `all-articles.html`
2. Add this at the bottom of `<body>`:
   ```html
   <script src="beehiiv-integration.js"></script>
   ```

## Recommended: Get Your Beehiiv API Key

For advanced features (like showing subscriber count), get your API key:

1. Go to https://app.beehiiv.com/settings/api
2. Create a new API key
3. Add it to `beehiiv-integration.js`:
   ```javascript
   const BEEHIIV_API_KEY = 'your-api-key';
   ```

## What You Get With Beehiiv

✅ **Free plan**: Up to 2,500 subscribers  
✅ **Bi-weekly sends**: Exactly what you need  
✅ **Beautiful templates**: Built-in email designs  
✅ **Analytics**: Track opens, clicks, unsubscribes  
✅ **Referral program**: Built-in growth features  
✅ **Custom domain**: Use your own domain (thegirlybeing.com)  

## Next Steps

1. **Go to Beehiiv dashboard** → https://app.beehiiv.com
2. **Customize your subscribe page** to match Girly Being colors
3. **Get the embed code** (Settings → Subscribe Form → Embed)
4. **Replace forms** in your HTML with the embed
5. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Integrate Beehiiv newsletter signup"
   git push origin main
   ```

## Testing

After integration:
1. Open your website locally
2. Enter test email in signup form
3. Check Beehiiv dashboard → Subscribers (should appear)
4. Check your email for welcome message

## Migration from Other Platforms

If you have subscribers elsewhere:
1. Beehiiv dashboard → Subscribers → Import
2. Upload CSV with emails
3. They'll automatically get your next newsletter

---

Need help? Beehiiv has great docs: https://beehiiv.com/resources
