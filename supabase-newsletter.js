// supabase-newsletter.js - Connects Girly Being to Supabase
// Add this script to your HTML pages

const SUPABASE_URL = 'https://your-project.supabase.co' // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'your-anon-key' // Replace with your Supabase anon key

// Initialize Supabase client
let supabase

try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
} catch (e) {
  console.error('Supabase not loaded:', e)
}

// Newsletter signup function
async function subscribeToNewsletter(email, name = '') {
  if (!email || !email.includes('@')) {
    showMessage('Please enter a valid email address', 'error')
    return false
  }

  try {
    // Insert subscriber into database
    const { data, error } = await supabase
      .from('subscribers')
      .insert([
        { 
          email: email, 
          name: name,
          source: window.location.pathname,
          status: 'active'
        }
      ])
      .select()

    if (error) {
      if (error.code === '23505') {
        showMessage('You\'re already subscribed! ✿', 'success')
        return true
      }
      throw error
    }

    // Send welcome email via Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: email,
        name: name,
        type: 'welcome'
      }),
    })

    if (!response.ok) {
      console.error('Failed to send welcome email')
    }

    showMessage('Welcome to It\'s a Girl Thing! Check your email ✿', 'success')
    return true

  } catch (error) {
    console.error('Subscription error:', error)
    showMessage('Something went wrong. Please try again.', 'error')
    return false
  }
}

// Helper function to show messages
function showMessage(message, type = 'success') {
  const existingMsg = document.querySelector('.newsletter-message')
  if (existingMsg) existingMsg.remove()

  const msgEl = document.createElement('div')
  msgEl.className = `newsletter-message ${type}`
  msgEl.textContent = message
  msgEl.style.cssText = `
    padding: 12px 20px;
    border-radius: 8px;
    margin-top: 12px;
    font-family: 'Quicksand', sans-serif;
    font-size: 14px;
    font-weight: 600;
    animation: fadeIn 0.3s ease;
  `
  
  if (type === 'success') {
    msgEl.style.background = 'linear-gradient(135deg, #27AE60, #2ECC71)'
    msgEl.style.color = 'white'
  } else {
    msgEl.style.background = '#E74C3C'
    msgEl.style.color = 'white'
  }

  // Find the newsletter form and append message
  const form = document.querySelector('.nl-form-wrap, .inl-right, .sn-form')
  if (form) {
    form.appendChild(msgEl)
    setTimeout(() => msgEl.remove(), 5000)
  }
}

// Initialize newsletter forms when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Hero newsletter form (index.html)
  const heroForm = document.getElementById('hero-email-form')
  if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      const email = heroForm.querySelector('input[type="email"]')?.value
      if (email) {
        await subscribeToNewsletter(email)
        heroForm.reset()
      }
    })
  }

  // Inline newsletter form (all-articles.html)
  const inlBtn = document.querySelector('.inl-btn')
  const inlInput = document.querySelector('.inl-input')
  if (inlBtn && inlInput) {
    inlBtn.addEventListener('click', async () => {
      const email = inlInput.value.trim()
      if (email) {
        await subscribeToNewsletter(email)
        inlInput.value = ''
      }
    })
  }

  // Sidebar newsletter form
  const snBtn = document.querySelector('.sn-btn')
  const snInput = document.querySelector('.sn-input')
  if (snBtn && snInput) {
    snBtn.addEventListener('click', async () => {
      const email = snInput.value.trim()
      if (email) {
        await subscribeToNewsletter(email)
        snInput.value = ''
      }
    })
  }

  // Bottom capture newsletter
  const bcBtn = document.querySelector('.bc-btn')
  const bcInput = document.querySelector('.bc-input')
  if (bcBtn && bcInput) {
    bcBtn.addEventListener('click', async () => {
      const email = bcInput.value.trim()
      if (email) {
        await subscribeToNewsletter(email)
        bcInput.value = ''
      }
    })
  }

  // Generic newsletter forms with class 'newsletter-form'
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const email = form.querySelector('input[type="email"]')?.value
      if (email) {
        await subscribeToNewsletter(email)
        form.reset()
      }
    })
  })
})

// CSS animation for messages
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`
document.head.appendChild(style)
