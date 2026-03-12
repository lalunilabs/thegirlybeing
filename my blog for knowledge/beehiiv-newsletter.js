// Beehiiv Newsletter Integration for Girly Being
// Keeps custom styling but saves subscribers to Beehiiv

const BEEHIIV_SUBSCRIBE_URL = 'https://itsagirlthing.beehiiv.com/subscribe';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initBeehiivForms();
  addAttributionScript();
});

function initBeehiivForms() {
  // Hero newsletter form (index.html)
  const heroForm = document.querySelector('.nl-form-wrap');
  if (heroForm) {
    const btn = heroForm.querySelector('.nl-btn');
    const input = heroForm.querySelector('.nl-input');
    
    if (btn && input) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleSubscribe(input.value, heroForm);
      });
      
      // Also handle Enter key
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubscribe(input.value, heroForm);
        }
      });
    }
  }
  
  // Inline newsletter form (all-articles.html)
  const inlineForm = document.querySelector('.inline-nl .inl-right');
  if (inlineForm) {
    const btn = inlineForm.querySelector('.inl-btn');
    const input = inlineForm.querySelector('.inl-input');
    
    if (btn && input) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleSubscribe(input.value, inlineForm);
      });
      
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubscribe(input.value, inlineForm);
        }
      });
    }
  }
  
  // Sidebar newsletter form (all-articles.html)
  const sidebarForm = document.querySelector('.sb-nl');
  if (sidebarForm) {
    const btn = sidebarForm.querySelector('.sn-btn');
    const input = sidebarForm.querySelector('.sn-input');
    
    if (btn && input) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleSubscribe(input.value, sidebarForm);
      });
      
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubscribe(input.value, sidebarForm);
        }
      });
    }
  }
  
  // Bottom capture form (all-articles.html)
  const bottomForm = document.querySelector('.bottom-capture .bc-right');
  if (bottomForm) {
    const btn = bottomForm.querySelector('.bc-btn');
    const input = bottomForm.querySelector('.bc-input');
    
    if (btn && input) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleSubscribe(input.value, bottomForm);
      });
      
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubscribe(input.value, bottomForm);
        }
      });
    }
  }
}

function handleSubscribe(email, container) {
  // Validate email
  if (!email || !email.includes('@') || !email.includes('.')) {
    showMessage(container, 'Please enter a valid email address ✿', 'error');
    return;
  }
  
  // Show loading
  const btn = container.querySelector('button');
  const originalText = btn.textContent;
  btn.textContent = 'Opening...';
  btn.disabled = true;
  
  // Track the conversion with Beehiiv attribution
  if (window.beehiivAttribution) {
    window.beehiivAttribution.convert();
  }
  
  // Show success message
  showMessage(container, 'Opening subscription page... ✿', 'success');
  
  // Open Beehiiv subscribe page with email pre-filled
  const subscribeUrl = `${BEEHIIV_SUBSCRIBE_URL}?email=${encodeURIComponent(email)}`;
  window.open(subscribeUrl, '_blank');
  
  // Reset button after a moment
  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled = false;
  }, 2000);
}

function showMessage(container, message, type) {
  // Remove existing messages
  const existingMsg = container.querySelector('.beehiiv-message');
  if (existingMsg) existingMsg.remove();
  
  const msgEl = document.createElement('div');
  msgEl.className = 'beehiiv-message';
  msgEl.textContent = message;
  msgEl.style.cssText = `
    padding: 10px 16px;
    border-radius: 8px;
    margin-top: 10px;
    font-family: 'Quicksand', sans-serif;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    animation: fadeIn 0.3s ease;
  `;
  
  if (type === 'success') {
    msgEl.style.background = 'rgba(39, 174, 96, 0.9)';
    msgEl.style.color = 'white';
  } else {
    msgEl.style.background = 'rgba(231, 76, 60, 0.9)';
    msgEl.style.color = 'white';
  }
  
  container.appendChild(msgEl);
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (msgEl.parentNode) msgEl.remove();
  }, 4000);
}

function addAttributionScript() {
  // Add Beehiiv attribution script for tracking
  if (!document.getElementById('beehiiv-attribution')) {
    const script = document.createElement('script');
    script.id = 'beehiiv-attribution';
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://subscribe-forms.beehiiv.com/attribution.js';
    
    script.onload = () => {
      console.log('Beehiiv attribution loaded');
      window.beehiivAttribution = {
        convert: function() {
          // Track conversion
          if (window.beehiiv) {
            window.beehiiv('track', 'Subscribe');
          }
        }
      };
    };
    
    document.head.appendChild(script);
  }
}

// Add fade animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
