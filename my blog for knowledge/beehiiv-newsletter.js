// Beehiiv Newsletter Integration - Keeps Girly Being Styling
// Submits to Beehiiv without leaving the site

const BEEHIIV_FORM_URL = 'https://subscribe-forms.beehiiv.com/e4fa0a54-0b54-4cbe-9929-55ff878c774f';
const BEEHIIV_ATTRIBUTION_URL = 'https://subscribe-forms.beehiiv.com/attribution.js';

document.addEventListener('DOMContentLoaded', () => {
  loadAttributionScript();
  initAllNewsletterForms();
});

function loadAttributionScript() {
  if (!document.getElementById('beehiiv-attribution')) {
    const script = document.createElement('script');
    script.id = 'beehiiv-attribution';
    script.type = 'text/javascript';
    script.async = true;
    script.src = BEEHIIV_ATTRIBUTION_URL;
    document.head.appendChild(script);
  }
}

function initAllNewsletterForms() {
  // Homepage hero form
  const heroForm = document.querySelector('.nl-form-wrap');
  if (heroForm) initForm(heroForm, '.nl-input', '.nl-btn');
  
  // All-articles inline form
  const inlineForm = document.querySelector('.inline-nl .inl-right');
  if (inlineForm) initForm(inlineForm, '.inl-input', '.inl-btn');
  
  // Sidebar newsletter form
  const sidebarForm = document.querySelector('.sb-nl');
  if (sidebarForm) initForm(sidebarForm, '.sn-input', '.sn-btn');
  
  // Bottom capture form
  const bottomForm = document.querySelector('.bottom-capture .bc-right');
  if (bottomForm) initForm(bottomForm, '.bc-input', '.bc-btn');
  
  // Post page sidebar forms
  document.querySelectorAll('.sb-card').forEach(card => {
    if (card.querySelector('.sb-nl-input')) {
      initForm(card, '.sb-nl-input', '.sb-nl-btn');
    }
  });
  
  // Post page inline newsletter forms
  document.querySelectorAll('.newsletter-form').forEach(form => {
    initNewsletterForm(form);
  });
}

function initForm(container, inputSelector, btnSelector) {
  const input = container.querySelector(inputSelector);
  const btn = container.querySelector(btnSelector);
  
  if (!input || !btn) return;
  
  // Remove any old click handlers by cloning
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  
  newBtn.addEventListener('click', (e) => {
    e.preventDefault();
    submitToBeehiiv(input.value.trim(), container, newBtn);
  });
  
  // Handle Enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitToBeehiiv(input.value.trim(), container, newBtn);
    }
  });
}

function initNewsletterForm(form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const btn = form.querySelector('button[type="submit"]');
    if (input && btn) {
      submitToBeehiiv(input.value.trim(), form, btn);
    }
  });
}

function submitToBeehiiv(email, container, btn) {
  // Validate email
  if (!email || !email.includes('@') || !email.includes('.')) {
    showStatus(container, 'Please enter a valid email ✿', 'error');
    return;
  }
  
  // Show loading
  const originalText = btn.textContent;
  btn.textContent = 'Subscribing...';
  btn.disabled = true;
  
  // Create hidden iframe form to submit to Beehiiv
  const iframeId = 'beehiiv-submit-' + Date.now();
  const iframe = document.createElement('iframe');
  iframe.id = iframeId;
  iframe.name = iframeId;
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  // Create form to submit to iframe
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = BEEHIIV_FORM_URL;
  form.target = iframeId;
  form.style.display = 'none';
  
  // Add email field
  const emailField = document.createElement('input');
  emailField.type = 'hidden';
  emailField.name = 'email';
  emailField.value = email;
  form.appendChild(emailField);
  
  document.body.appendChild(form);
  
  // Listen for iframe load (submission complete)
  iframe.onload = () => {
    showStatus(container, 'Subscribed! Check your email ✿', 'success');
    btn.textContent = 'Subscribed! ✿';
    btn.style.background = 'linear-gradient(135deg,#27AE60,#2ECC71)';
    
    const input = container.querySelector('input[type="email"]');
    if (input) input.value = '';
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
    
    setTimeout(() => {
      if (form.parentNode) form.remove();
      if (iframe.parentNode) iframe.remove();
    }, 5000);
  };
  
  // Submit the form
  form.submit();
  
  // Fallback timeout
  setTimeout(() => {
    if (btn.textContent === 'Subscribing...') {
      showStatus(container, 'Subscribed! Check your email ✿', 'success');
      btn.textContent = originalText;
      btn.disabled = false;
      const input = container.querySelector('input[type="email"]');
      if (input) input.value = '';
    }
  }, 5000);
}

function showStatus(container, message, type) {
  const existing = container.querySelector('.beehiiv-status');
  if (existing) existing.remove();
  
  const status = document.createElement('p');
  status.className = 'beehiiv-status';
  status.textContent = message;
  status.style.cssText = `
    margin-top: 10px;
    font-family: 'Quicksand', sans-serif;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    animation: fadeIn 0.3s ease;
  `;
  
  if (type === 'success') {
    status.style.color = '#27AE60';
  } else {
    status.style.color = '#E74C3C';
  }
  
  container.appendChild(status);
  
  setTimeout(() => {
    if (status.parentNode) status.remove();
  }, 5000);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
